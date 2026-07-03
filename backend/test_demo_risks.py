import sys
import os
from pathlib import Path
from backend.inference1 import GenomicInference

engine = GenomicInference()
vcf_dir = Path(__file__).parent / "data" / "demo_vcf"
vcf_files = list(vcf_dir.rglob("*.vcf"))

print(f"Testing {len(vcf_files)} files...")
for v in vcf_files:
    try:
        res = engine.predict_all(str(v))
        risks = res["risks"]
        print(f"File: {v.name} -> Diabetes: {risks.get('diabetes', 0)}%, Cardio: {risks.get('cardio', 0)}%, Baldness: {risks.get('baldness', 0)}%, Alzheimer: {risks.get('alzheimer', 0)}%")
    except Exception as e:
        print(f"Error {v.name}: {e}")
