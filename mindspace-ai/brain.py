import ollama
import os
from langchain_chroma import Chroma
from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_community.document_loaders import DirectoryLoader, TextLoader

class MindSpaceBrain:
    def __init__(self):
        # 1. SETUP EMBEDDINGS (The "Translator" that turns text into math)
        self.embeddings = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")
        self.persist_dir = "./mindspace_brain"
        self.data_dir = "./data"
        
        # Ensure the data folder exists so the code doesn't crash
        if not os.path.exists(self.data_dir):
            os.makedirs(self.data_dir)
            
        # 2. LOAD THE VECTOR DATABASE
        self.vectorstore = Chroma(
            persist_directory=self.persist_dir, 
            embedding_function=self.embeddings
        )

    def process_new_logs(self):
        """
        Scans the /data folder for psychology .txt files and 
        adds them to the AI's long-term memory.
        """
        # Load all .txt files from the data folder
        loader = DirectoryLoader(self.data_dir, glob="./*.txt", loader_cls=TextLoader)
        docs = loader.load()
        
        if not docs:
            return "No text files found in the /data folder. Add some psychology .txt files first!"
        
        # Split text into chunks (better for AI to read)
        text_splitter = RecursiveCharacterTextSplitter(chunk_size=600, chunk_overlap=100)
        splits = text_splitter.split_documents(docs)
        
        # Re-build the vector store with the new data
        self.vectorstore = Chroma.from_documents(
            documents=splits, 
            embedding=self.embeddings, 
            persist_directory=self.persist_dir
        )
        return f"Brain Updated: Indexed {len(docs)} psychology documents."

    def get_relevant_context(self, query):
        """
        Searches the psychology database for facts related to the user's question.
        """
        # We search for the top 3 most relevant chunks
        results = self.vectorstore.similarity_search(query, k=3)
        
        if not results:
            return "No specific psychology context found."
        
        # Combine the chunks into one context string
        context = "\n---\n".join([res.page_content for res in results])
        return context

# Initialize the brain instance for main.py to import
brain = MindSpaceBrain()