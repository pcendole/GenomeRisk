import json
import numpy as np
import pandas as pd
from pathlib import Path
import xgboost as xgb
from xgboost import XGBClassifier

# Base mapping for VCF parse genotypes
def read_vcf(vcf_path):
    genotypes = {}
    try:
        with open(vcf_path, 'r') as f:
            for line in f:
                if line.startswith("#") or not line.strip():
                    continue
                parts = line.split("\t")
                if len(parts) < 10:
                    continue
                
                rsid = parts[2].strip()
                if not rsid or rsid == ".":
                    continue

                gt_str = parts[9].split(":")[0].replace("|", "/")
                alleles = gt_str.split("/")
                alt_dosage = 0
                for allele in alleles:
                    allele = allele.strip()
                    if allele == ".":
                        continue
                    if allele.isdigit() and int(allele) > 0:
                        alt_dosage += 1

                dosage = min(alt_dosage, 2)
                prev = genotypes.get(rsid)
                genotypes[rsid] = dosage if prev is None else max(prev, dosage)
    except Exception as e:
        print(f"Error parsing VCF: {e}")
    return genotypes

def get_risk_level(probability_percent):
    if probability_percent >= 80:
        return "Very High"
    elif probability_percent >= 60:
        return "High"
    elif probability_percent >= 40:
        return "Moderate"
    elif probability_percent >= 20:
        return "Low"
    else:
        return "Very Low"

class GenomicInference:
    def __init__(self):
        # Paths
        self.base_dir = Path(__file__).parent
        self.data_dir = self.base_dir / "data"
        self.models_dir = self.data_dir / "models"
        
        # Load native XGBoost models and features for accurate risk predictions
        self.health_models = {}
        self.features = {}
        
        configs = {
            'baldness': {
                'm': self.models_dir / "baldness" / "xgboost_baldness_model.json",
                'f': self.models_dir / "baldness" / "feature_names.json"
            },
            'cardio': {
                'm': self.models_dir / "cardio" / "ldl_xgboost_model.json",
                'f': self.models_dir / "cardio" / "ldl_feature_names.json"
            },
            'diabetes': {
                'm': self.models_dir / "diabetes" / "t2d_xgboost_model_simple.json",
                'f': self.models_dir / "diabetes" / "t2d_feature_names.json"
            },
            'alzheimer': {
                'm': self.models_dir / "alzheimer" / "alzheimer_xgboost_model.json",
                'f': self.models_dir / "alzheimer" / "alzheimer_feature_names.json"
            }
        }
        
        for trait, paths in configs.items():
            if paths['m'].exists():
                model = XGBClassifier()
                model.load_model(str(paths['m']))
                self.health_models[trait] = model
            if paths['f'].exists():
                with open(paths['f'], 'r') as f:
                    self.features[trait] = json.load(f)
                    

                
        print(f"XGBoost-Only Inference Engine Initialized (Native models loaded: {list(self.health_models.keys())})")

    def predict_all(self, vcf_path, selected_traits=None, patient_gender="male"):
        genotypes = read_vcf(vcf_path)
        
        results = {
            "risks": {},
            "topLoci": {},
            "explanations": {},
            "metadata": {
                "total_snps_found": len(genotypes),
                "timestamp": pd.Timestamp.now().strftime("%Y-%m-%d %H:%M:%S")
            }
        }
        
        target_traits = ['diabetes', 'baldness', 'cardio', 'alzheimer']
        if selected_traits:
            target_traits = [t for t in target_traits if t in selected_traits]
            
        for trait in target_traits:
            if trait in self.health_models and trait in self.features:
                feat_list = self.features[trait]
                input_vec = [genotypes.get(snp, 0) for snp in feat_list]
                input_df = pd.DataFrame([input_vec], columns=feat_list)
                
                # Make prediction using disease-specific XGBoost model
                raw_prob = float(self.health_models[trait].predict_proba(input_df)[0][1])
                
                # Gender-specific override for male pattern baldness (if female, risk is 0)
                if trait == 'baldness' and patient_gender == 'female':
                    raw_prob = 0.0
            else:
                raw_prob = 0.0
                
            # Convert raw probability to percentage (0 to 100)
            prob_percent = round(raw_prob * 100, 2)
            results["risks"][trait] = prob_percent
            
            # Risk Categories
            risk_level = get_risk_level(prob_percent)
            
            # Confidence Score
            confidence = round(abs(raw_prob - 0.5) * 2 * 100, 2)
            
            # Feature Coverage Information
            total_snps = len(self.features.get(trait, []))
            matched_snps = sum(1 for snp in self.features.get(trait, []) if snp in genotypes)
            coverage_percent = round((matched_snps / total_snps) * 100.0, 1) if total_snps else 0.0
            

            
            # Calculate Tree SHAP Output using native XGBoost booster
            if trait in self.health_models and trait in self.features:
                booster = self.health_models[trait].get_booster()
                dmat = xgb.DMatrix(input_df)
                contribs = booster.predict(dmat, pred_contribs=True)[0]
                
                snp_contributions = []
                for i, rsid in enumerate(feat_list):
                    snp_contributions.append({
                        "rsid": rsid,
                        "genotype": genotypes.get(rsid, 0),
                        "contribution": float(contribs[i])
                    })
                
                # Sort by absolute contribution descending
                sorted_snps = sorted(snp_contributions, key=lambda x: abs(x["contribution"]), reverse=True)
                top_50 = sorted_snps[:50]
            else:
                sorted_snps = []
                top_50 = []
                
            # Format Top 50 SHAP contributions
            top50_shap = []
            for rank, item in enumerate(top_50, 1):
                top50_shap.append({
                    "rank": rank,
                    "rsid": item["rsid"],
                    "contribution": round(item["contribution"], 5),
                    "direction": "positive" if item["contribution"] > 0 else "negative"
                })
            
            # DeepLIFT is a placeholder/empty list (scientifically invalid logic removed)
            focal_rsid = sorted_snps[0]["rsid"] if sorted_snps else "None"
            deeplift_profile = []
                
            # Disease-Specific Explainability Summary
            positive_snps = [item for item in sorted_snps if item["contribution"] > 0]
            negative_snps = [item for item in sorted_snps if item["contribution"] < 0]
            
            top_positive_snp = positive_snps[0]["rsid"] if positive_snps else "None"
            top_negative_snp = negative_snps[0]["rsid"] if negative_snps else "None"
            
            all_abs_contribs = [abs(item["contribution"]) for item in sorted_snps]
            max_contrib = round(max(all_abs_contribs), 5) if all_abs_contribs else 0.0
            mean_contrib = round(float(np.mean(all_abs_contribs)), 5) if all_abs_contribs else 0.0
            
            explainability_summary = {
                "top_positive_snp": top_positive_snp,
                "top_negative_snp": top_negative_snp,
                "max_contribution": max_contrib,
                "mean_contribution": mean_contrib,
                "top50_count": len(top_50)
            }
            
            # Format top 5 SNPs as simplified SHAP output list (legacy compatibility)
            top_snps_formatted = [
                {
                    "rsid": item["rsid"],
                    "genotype": item["genotype"],
                    "contribution": round(item["contribution"], 3)
                }
                for item in top_50[:5]
            ]
            
            # Save top 5 native loci to results so that frontend Results.jsx renders them
            results["topLoci"][trait] = [
                {
                    "rsid": item["rsid"],
                    "genotype": item["genotype"],
                    "contribution": item["contribution"]
                }
                for item in top_50[:5]
            ]
            
            # Save trait-specific dictionary structure
            results[trait] = {
                "probability": prob_percent,
                "confidence": confidence,
                "risk_level": risk_level,
                "matched_snps": matched_snps,
                "total_snps": total_snps,
                "coverage_percent": coverage_percent,
                "top_snps": top_snps_formatted,
                "top50_shap": top50_shap,
                "deeplift_profile": deeplift_profile,
                "focal_rsid": focal_rsid,
                "explainability_summary": explainability_summary
            }
            
            # Save to explanations for legacy frontend tabbed views
            results["explanations"][trait] = {
                "top50_shap": top50_shap,
                "deeplift_profile": deeplift_profile,
                "focal_rsid": focal_rsid,
                "explainability_summary": explainability_summary
            }
            
        results["metadata"]["traits_run"] = target_traits
        results["metadata"]["requested_traits"] = selected_traits or []
        
        return results

inference_engine = GenomicInference()
