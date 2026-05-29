import uuid
from datetime import datetime, timezone
from typing import Any, Dict, List

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, ConfigDict

from database import db
from auth import get_current_user

# --------------------------------------------------------------------------- #
#  Default content (mirrors the original hardcoded landing page)
# --------------------------------------------------------------------------- #
DEFAULT_CONTENT: Dict[str, Any] = {
    "settings": {
        "siteName": "Green-Haus",
        "logo": "https://customer-assets.emergentagent.com/job_direct-trade-5/artifacts/zbmsvdz6_logo.png",
        "footerDescription": "Direct-trade coffee. Fairer futures. Connecting women farmers in Rwanda and Burundi with Germany.",
        "footerTagline": "Direct-trade coffee. Fairer futures.",
        "copyright": "Green-Haus \u00a9 2026",
    },
    "navLinks": [
        {"id": "about", "label": "Our Story"},
        {"id": "products", "label": "Coffee"},
        {"id": "founder", "label": "Founder"},
        {"id": "impact", "label": "Impact"},
        {"id": "contact", "label": "Contact"},
    ],
    "categories": ["Whole Bean", "Ground", "Single Origin", "Specialty"],
    "hero": {
        "overline": "Rwanda \u00b7 Burundi \u2192 Germany",
        "headline": "Direct-Trade Coffee Empowering",
        "headlineAccent": "Women Farmers",
        "subheadline": "Green-Haus connects women coffee producers in Rwanda and Burundi directly with the German specialty coffee market \u2014 ensuring fair compensation, financial independence, and stronger local communities.",
        "ctaPrimary": "Explore our coffee",
        "ctaSecondary": "Contact us",
        "image": "https://images.pexels.com/photos/31835038/pexels-photo-31835038.jpeg?auto=compress&cs=tinysrgb&w=1200",
        "badgeText": "\u201cFrom the hills to your cup.\u201d",
        "badgeSub": "Single origin \u00b7 Direct trade",
        "stats": [
            {"top": "Women-led", "bottom": "cooperatives"},
            {"top": "Direct", "bottom": "trade model"},
            {"top": "Specialty", "bottom": "grade beans"},
        ],
    },
    "about": {
        "overline": "Our Story",
        "heading": "A bridge between East African farms and German cups.",
        "image": "https://images.pexels.com/photos/34792534/pexels-photo-34792534.jpeg?auto=compress&cs=tinysrgb&w=1200",
        "paragraph1": "Green-Haus is dedicated to transforming the lives of women coffee farmers in Rwanda and Burundi. Through our direct-trade model, we connect these producers directly with the German coffee market, ensuring they receive equitable compensation.",
        "paragraph2": "This social impact fosters financial independence, strengthens local communities, and promotes gender equality across the specialty coffee supply chain.",
    },
    "products_section": {
        "overline": "The Collection",
        "heading": "Five expressions of East African terroir.",
        "intro": "Each lot is traceable to the cooperative that grew it. Prices shown are per 250g bag \u2014 wholesale inquiries welcome.",
    },
    "founder": {
        "overline": "Meet the Founder",
        "name": "Nsabemungu Christian Aime",
        "image": "https://customer-assets.emergentagent.com/job_direct-trade-5/artifacts/v1gwh2s0_Christian.jpg",
        "quote": "\u201cFounded with a mission to create fairer access between East African women coffee farmers and the German coffee market \u2014 one carefully sourced harvest at a time.\u201d",
        "role": "\u2014 Founder, Green-Haus",
    },
    "impact": {
        "overline": "Our Impact",
        "heading": "Coffee that gives back to the hands that grow it.",
        "items": [
            {"title": "Fair compensation", "body": "Equitable, transparent pricing paid directly to women cooperatives \u2014 no middlemen, no hidden margins."},
            {"title": "Direct market access", "body": "We bring East African specialty coffee straight to German roasters, caf\u00e9s and households."},
            {"title": "Stronger communities", "body": "Reinvested premiums fund schooling, health and farm infrastructure for the next generation of growers."},
        ],
    },
    "contact": {
        "overline": "Get in touch",
        "heading": "Contact Green-Haus.",
        "intro": "For wholesale, partnerships or just a conversation about specialty East African coffee \u2014 we'd love to hear from you.",
        "addressLine1": "L\u00fcneburg, 21337",
        "addressLine2": "Germany",
        "phone": "+4915214300152",
        "phoneDisplay": "(+49) 0152 143 001 52",
        "email": "nsabemungu@gmail.com",
    },
}

DEFAULT_PRODUCTS: List[Dict[str, Any]] = [
    {
        "id": "rwanda-womens-cooperative",
        "name": "SanCoffee Medium Roasted Beans 500g",
        "origin": "Rwanda",
        "roast": "Medium Roast",
        "category": "Whole Bean",
        "notes": ["Citrus", "Caramel", "Red berries"],
        "price": 18,
        "description": "Hand-picked at high altitude by a women-led cooperative in the hills of Western Rwanda. Bright, juicy and gently sweet \u2014 500g whole beans.",
        "image": "https://customer-assets.emergentagent.com/job_direct-trade-5/artifacts/v8bcs3m2_Sancoffee_500g_beans_medium_roasted_at_8000.jpeg",
    },
    {
        "id": "rwanda-bourbon",
        "name": "Burundi Ngoma Coffee \u2014 ARFIC",
        "origin": "Burundi",
        "roast": "Medium-Dark Roast",
        "category": "Whole Bean",
        "notes": ["Chocolate", "Honey", "Floral"],
        "price": 22,
        "description": "Pure Arabica from the Burundian highlands, packaged by ARFIC. Rich body, layered sweetness and a quiet floral lift \u2014 250g.",
        "image": "https://customer-assets.emergentagent.com/job_direct-trade-5/artifacts/d2v0v5ke_front_fr.6.400.jpg",
    },
    {
        "id": "burundi-kayanza",
        "name": "3 African Sisters Burundi Single Origin",
        "origin": "Burundi \u00b7 Kayanza",
        "roast": "Medium Roast",
        "category": "Single Origin",
        "notes": ["Caramel", "Sweet citrus", "Berries"],
        "price": 19,
        "description": "100% Arabica from the Kayanza highlands of northern Burundi. Full-bodied, creamy caramel with bright acidity and delicate fruit \u2014 1kg whole beans.",
        "image": "https://customer-assets.emergentagent.com/job_direct-trade-5/artifacts/wc8att50_3AS_COFFEE_BUR_1KG.webp",
    },
    {
        "id": "burundi-ngozi",
        "name": "EAC Speciality Arabica \u00b7 Yellow Bourbon",
        "origin": "Burundi",
        "roast": "Dark Roast \u00b7 Ground",
        "category": "Ground",
        "notes": ["Dark chocolate", "Spice", "Roasted nuts"],
        "price": 21,
        "description": "Organic Yellow Bourbon from East African Coffees \u2014 bold, full-bodied and lingering. Ground dark roast, 250g, built for slow mornings and espresso.",
        "image": "https://customer-assets.emergentagent.com/job_direct-trade-5/artifacts/q71jlgpr_coffee-new-finall-44-%E5%89%AF%E6%9C%AC-932x1536.jpg",
    },
    {
        "id": "direct-trade-blend",
        "name": "Ndabaga Women's Coffee \u2014 Rwanda",
        "origin": "Rwanda",
        "roast": "Medium Roast",
        "category": "Specialty",
        "notes": ["Balanced fruit", "Caramel sweetness", "Smooth finish"],
        "price": 24,
        "description": "Premium Arabica from the Ndabaga women's cooperative in Rwanda. Available as whole beans or ground \u2014 a balanced, traceable expression of East African terroir, 453g.",
        "image": "https://customer-assets.emergentagent.com/job_direct-trade-5/artifacts/b4xwgvld_Ndabaga-ground-coffee.jpg",
    },
]


# --------------------------------------------------------------------------- #
#  Schemas
# --------------------------------------------------------------------------- #
class ProductIn(BaseModel):
    model_config = ConfigDict(extra="ignore")
    name: str
    origin: str = ""
    roast: str = ""
    category: str = ""
    notes: List[str] = []
    price: float = 0
    description: str = ""
    image: str = ""
    published: bool = True


# --------------------------------------------------------------------------- #
#  Public routes
# --------------------------------------------------------------------------- #
public_router = APIRouter(prefix="/api", tags=["public-content"])


@public_router.get("/content")
async def get_content():
    doc = await db.site_content.find_one({"key": "main"}, {"_id": 0})
    if not doc:
        return DEFAULT_CONTENT
    return doc.get("data", DEFAULT_CONTENT)


@public_router.get("/products")
async def list_public_products():
    return await db.products.find({"published": True}, {"_id": 0}).sort("order", 1).to_list(1000)


# --------------------------------------------------------------------------- #
#  Admin routes (editor only)
# --------------------------------------------------------------------------- #
admin_router = APIRouter(prefix="/api/admin", tags=["admin-content"])


@admin_router.put("/content")
async def update_content(payload: Dict[str, Any], user=Depends(get_current_user)):
    await db.site_content.update_one(
        {"key": "main"},
        {"$set": {"data": payload, "updated_at": datetime.now(timezone.utc).isoformat()}},
        upsert=True,
    )
    return {"status": "success", "message": "Content published."}


@admin_router.get("/products")
async def list_admin_products(user=Depends(get_current_user)):
    return await db.products.find({}, {"_id": 0}).sort("order", 1).to_list(1000)


@admin_router.post("/products")
async def create_product(payload: ProductIn, user=Depends(get_current_user)):
    count = await db.products.count_documents({})
    doc = payload.model_dump()
    doc["id"] = str(uuid.uuid4())
    doc["order"] = count
    doc["created_at"] = datetime.now(timezone.utc).isoformat()
    await db.products.insert_one(doc)
    doc.pop("_id", None)
    return doc


@admin_router.put("/products/{product_id}")
async def update_product(product_id: str, payload: ProductIn, user=Depends(get_current_user)):
    res = await db.products.update_one({"id": product_id}, {"$set": payload.model_dump()})
    if res.matched_count == 0:
        raise HTTPException(status_code=404, detail="Product not found")
    return await db.products.find_one({"id": product_id}, {"_id": 0})


@admin_router.delete("/products/{product_id}")
async def delete_product(product_id: str, user=Depends(get_current_user)):
    res = await db.products.delete_one({"id": product_id})
    if res.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Product not found")
    return {"status": "deleted"}


@admin_router.patch("/products/{product_id}/publish")
async def toggle_publish(product_id: str, user=Depends(get_current_user)):
    doc = await db.products.find_one({"id": product_id})
    if not doc:
        raise HTTPException(status_code=404, detail="Product not found")
    new_val = not doc.get("published", True)
    await db.products.update_one({"id": product_id}, {"$set": {"published": new_val}})
    return {"id": product_id, "published": new_val}


# --------------------------------------------------------------------------- #
#  Seeding
# --------------------------------------------------------------------------- #
async def seed_content_and_products():
    if not await db.site_content.find_one({"key": "main"}):
        await db.site_content.insert_one({
            "key": "main",
            "data": DEFAULT_CONTENT,
            "updated_at": datetime.now(timezone.utc).isoformat(),
        })
    if await db.products.count_documents({}) == 0:
        for i, p in enumerate(DEFAULT_PRODUCTS):
            doc = dict(p)
            doc["order"] = i
            doc["published"] = True
            doc["created_at"] = datetime.now(timezone.utc).isoformat()
            await db.products.insert_one(doc)
