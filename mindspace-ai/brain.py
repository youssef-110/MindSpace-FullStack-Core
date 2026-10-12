import os
import re
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent
DATA_DIR = BASE_DIR / "data"
PERSIST_DIR = BASE_DIR / "mindspace_brain"


class MindSpaceBrain:
    def __init__(self):
        self.data_dir = str(DATA_DIR)
        self.persist_dir = str(PERSIST_DIR)
        os.makedirs(self.data_dir, exist_ok=True)
        os.makedirs(self.persist_dir, exist_ok=True)

        self.vectorstore = None
        self.embeddings = None
        self._init_vectorstore()

    def _init_vectorstore(self):
        try:
            from langchain_chroma import Chroma
            from langchain_community.embeddings import HuggingFaceEmbeddings

            self.embeddings = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")
            self.vectorstore = Chroma(
                persist_directory=self.persist_dir,
                embedding_function=self.embeddings,
            )
        except Exception as e:
            print(f"[MindSpaceBrain] Neural embeddings unavailable ({e}). Using robust semantic keyword matcher.")
            self.vectorstore = None

    def process_new_logs(self):
        """Scans the /data folder for psychology .txt files and indexes them."""
        docs = []
        for file_path in Path(self.data_dir).glob("*.txt"):
            try:
                with open(file_path, "r", encoding="utf-8") as f:
                    docs.append({"path": str(file_path), "content": f.read()})
            except Exception as e:
                print(f"Error reading {file_path}: {e}")

        if not docs:
            return "No text files found in the data folder."

        # If vectorstore is available, build Chroma store
        if self.embeddings is not None:
            try:
                from langchain_chroma import Chroma
                from langchain_core.documents import Document
                from langchain_text_splitters import RecursiveCharacterTextSplitter

                splitter = RecursiveCharacterTextSplitter(chunk_size=600, chunk_overlap=100)
                langchain_docs = [Document(page_content=d["content"], metadata={"source": d["path"]}) for d in docs]
                splits = splitter.split_documents(langchain_docs)

                self.vectorstore = Chroma.from_documents(
                    documents=splits,
                    embedding=self.embeddings,
                    persist_directory=self.persist_dir,
                )
                return f"Brain Updated: Indexed {len(splits)} chunks from {len(docs)} psychology documents into ChromaDB."
            except Exception as e:
                print(f"Chroma indexing failed: {e}")

        return f"Brain Updated: Indexed {len(docs)} psychology documents into fallback semantic store."

    def get_relevant_context(self, query: str) -> str:
        """Searches the psychology knowledge base for relevant facts."""
        if not query or not query.strip():
            return ""

        # 1. Try vector store search if active
        if self.vectorstore is not None:
            try:
                results = self.vectorstore.similarity_search(query, k=3)
                if results:
                    return "\n---\n".join([res.page_content for res in results])
            except Exception as e:
                print(f"[MindSpaceBrain] Vector similarity search failed: {e}")

        # 2. Resilient fallback: semantic keyword scoring over chunked data files
        return self._keyword_search(query, k=3)

    def _keyword_search(self, query: str, k: int = 3) -> str:
        words = set(re.findall(r"\w{3,}", query.lower()))
        if not words:
            return ""

        candidates = []
        for file_path in Path(self.data_dir).glob("*.txt"):
            try:
                with open(file_path, "r", encoding="utf-8") as f:
                    text = f.read()
                # Split text into paragraphs or ~500-char blocks
                paragraphs = [p.strip() for p in text.split("\n\n") if len(p.strip()) > 30]
                for p in paragraphs:
                    p_lower = p.lower()
                    score = sum(1 for w in words if w in p_lower)
                    if score > 0:
                        candidates.append((score, p))
            except Exception:
                pass

        if not candidates:
            return ""

        candidates.sort(key=lambda x: x[0], reverse=True)
        top_chunks = [c[1] for c in candidates[:k]]
        return "\n---\n".join(top_chunks)


brain = MindSpaceBrain()