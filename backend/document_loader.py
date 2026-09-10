from pathlib import Path


def load_document(file_path):

    path = Path(file_path)

    if not path.exists():
        return "Document not found."

    return path.read_text(encoding="utf-8")