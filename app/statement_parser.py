from __future__ import annotations

import csv
import io
import re
from dataclasses import dataclass
from datetime import datetime

from pypdf import PdfReader


@dataclass
class ParsedStatementTransaction:
    amount: float
    transaction_type: str
    description: str
    timestamp: datetime


DATE_FORMATS = (
    "%Y-%m-%d %H:%M:%S",
    "%Y-%m-%d %H:%M",
    "%Y-%m-%d",
    "%d/%m/%Y %H:%M:%S",
    "%d/%m/%Y %H:%M",
    "%d/%m/%Y",
    "%d-%m-%Y %H:%M:%S",
    "%d-%m-%Y %H:%M",
    "%d-%m-%Y",
)

INCOMING_KEYWORDS = ("received", "incoming", "deposit", "credited", "cash in", "payment received")
OUTGOING_KEYWORDS = ("sent", "outgoing", "withdraw", "debited", "bill", "airtime", "bundle", "payment", "transfer")


def parse_statement_file(filename: str, mime_type: str, raw_bytes: bytes) -> list[ParsedStatementTransaction]:
    lower_name = filename.lower()
    if lower_name.endswith(".csv") or "csv" in mime_type:
        return _parse_csv(raw_bytes)

    extracted_text = _extract_text(filename, mime_type, raw_bytes)
    return _parse_text_lines(extracted_text)


def _extract_text(filename: str, mime_type: str, raw_bytes: bytes) -> str:
    lower_name = filename.lower()

    if lower_name.endswith(".pdf") or "pdf" in mime_type:
        reader = PdfReader(io.BytesIO(raw_bytes))
        return "\n".join(page.extract_text() or "" for page in reader.pages)

    return raw_bytes.decode("utf-8-sig", errors="ignore")


def _parse_csv(raw_bytes: bytes) -> list[ParsedStatementTransaction]:
    content = raw_bytes.decode("utf-8-sig", errors="ignore")
    reader = csv.DictReader(io.StringIO(content))
    transactions: list[ParsedStatementTransaction] = []

    for row in reader:
        normalized_row = {(_normalize_header(key)): (value or "").strip() for key, value in row.items() if key}
        if not normalized_row:
            continue

        timestamp = _parse_datetime(
            normalized_row.get("timestamp")
            or normalized_row.get("datetime")
            or normalized_row.get("transactiondate")
            or normalized_row.get("date")
        )
        if timestamp is None:
            continue

        amount = _parse_amount(
            normalized_row.get("amount")
            or normalized_row.get("value")
            or normalized_row.get("transactionamount")
            or ""
        )
        if amount is None:
            continue

        transaction_type = _classify_transaction_type(
            normalized_row.get("transactiontype")
            or normalized_row.get("type")
            or normalized_row.get("direction")
            or normalized_row.get("description")
            or ""
        )
        description = (
            normalized_row.get("description")
            or normalized_row.get("details")
            or normalized_row.get("narration")
            or normalized_row.get("reference")
            or f"{transaction_type.title()} transaction"
        )
        transactions.append(
            ParsedStatementTransaction(
                amount=amount,
                transaction_type=transaction_type,
                description=description,
                timestamp=timestamp,
            )
        )

    return transactions


def _parse_text_lines(text: str) -> list[ParsedStatementTransaction]:
    transactions: list[ParsedStatementTransaction] = []

    for raw_line in text.splitlines():
        line = " ".join(raw_line.split())
        if len(line) < 12:
            continue

        timestamp = _find_datetime_in_line(line)
        amount = _parse_amount(line)
        if timestamp is None or amount is None:
            continue

        transaction_type = _classify_transaction_type(line)
        transactions.append(
            ParsedStatementTransaction(
                amount=amount,
                transaction_type=transaction_type,
                description=line[:240],
                timestamp=timestamp,
            )
        )

    deduped: dict[tuple[str, float, str, datetime], ParsedStatementTransaction] = {}
    for transaction in transactions:
        key = (
            transaction.transaction_type,
            transaction.amount,
            transaction.description,
            transaction.timestamp,
        )
        deduped[key] = transaction

    return sorted(deduped.values(), key=lambda item: item.timestamp)


def _normalize_header(value: str) -> str:
    return re.sub(r"[^a-z0-9]", "", value.lower())


def _parse_datetime(value: str | None) -> datetime | None:
    if not value:
        return None

    candidate = value.strip()
    for fmt in DATE_FORMATS:
        try:
            return datetime.strptime(candidate, fmt)
        except ValueError:
            continue
    return None


def _find_datetime_in_line(line: str) -> datetime | None:
    patterns = (
        r"\b\d{4}-\d{2}-\d{2}(?: \d{2}:\d{2}(?::\d{2})?)?\b",
        r"\b\d{2}/\d{2}/\d{4}(?: \d{2}:\d{2}(?::\d{2})?)?\b",
        r"\b\d{2}-\d{2}-\d{4}(?: \d{2}:\d{2}(?::\d{2})?)?\b",
    )

    for pattern in patterns:
        match = re.search(pattern, line)
        if match:
            parsed = _parse_datetime(match.group(0))
            if parsed is not None:
                return parsed

    return None


def _parse_amount(value: str) -> float | None:
    amount_matches = re.findall(r"(?:GHS|GH₵|GH¢|GHC)?\s*([0-9][0-9,]*\.?[0-9]{0,2})", value, flags=re.IGNORECASE)
    for candidate in amount_matches:
        normalized = candidate.replace(",", "").strip()
        try:
            amount = float(normalized)
        except ValueError:
            continue
        if amount > 0:
            return amount
    return None


def _classify_transaction_type(value: str) -> str:
    normalized = value.lower()
    if any(keyword in normalized for keyword in INCOMING_KEYWORDS):
        return "incoming"
    if any(keyword in normalized for keyword in OUTGOING_KEYWORDS):
        return "outgoing"
    return "incoming"
