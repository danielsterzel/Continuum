from fastapi import FastAPI

app = FastAPI(
    title="Continuum API",
    version="0.1.0"
)

@app.get("/")
async def root():
    return {"message" : "Continuum API is running"}

@app.get("/health")
async def health():
    return {"status": "ok"}


