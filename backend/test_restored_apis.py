import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_openapi_schema_and_swagger():
    response = client.get("/openapi.json")
    assert response.status_code == 200
    data = response.json()
    
    # Check security scheme for Swagger Authorize
    security_schemes = data.get("components", {}).get("securitySchemes", {})
    assert "OAuth2PasswordBearer" in security_schemes
    assert security_schemes["OAuth2PasswordBearer"]["type"] == "oauth2"
    assert security_schemes["OAuth2PasswordBearer"]["flows"]["password"]["tokenUrl"] == "/auth/login"

    # Check that restored paths exist in OpenAPI schema
    paths = data.get("paths", {})
    assert "/dashboard/me" in paths
    assert "/dashboard/history" in paths
    assert "/dashboard/user" in paths
    assert "/payment" in paths or "/payment/" in paths
    assert "/payment/{payment_id}" in paths
    assert "/review" in paths or "/review/" in paths
    assert "/review/lab/{lab_id}" in paths
    assert "/compare/{test_id}" in paths
    assert "/lab/top-rated" in paths
    assert "/lab/{lab_id}" in paths
    print("[PASS] OpenAPI schema and Swagger endpoints verified successfully")

def test_auth_and_swagger_authorize():
    # 1. Login with JSON
    json_resp = client.post("/auth/login", json={"email": "nishant@gmail.com", "password": "123"})
    # If this user/password isn't in DB with password "123", register a dedicated test user
    token = None
    if json_resp.status_code == 200:
        token = json_resp.json().get("access_token")
    else:
        reg_resp = client.post("/auth/register", json={
            "name": "Test User",
            "email": "testuser_swagger@example.com",
            "phone": "9898989898",
            "password": "Password123!"
        })
        # Try login with JSON
        json_resp = client.post("/auth/login", json={"email": "testuser_swagger@example.com", "password": "Password123!"})
        assert json_resp.status_code == 200
        token = json_resp.json().get("access_token")

    assert token is not None
    print("[PASS] JSON login verified successfully")

    # 2. Login with Form Data (Swagger Authorize button simulation)
    form_resp = client.post(
        "/auth/login",
        data={"username": "testuser_swagger@example.com", "password": "Password123!"}
        if json_resp.status_code == 200 and "testuser_swagger" in str(json_resp.json()) else
        {"username": "testuser_swagger@example.com", "password": "Password123!"}
    )
    if form_resp.status_code != 200:
        form_resp = client.post(
            "/auth/login",
            data={"username": "nishant@gmail.com", "password": "123"}
        )
    assert form_resp.status_code == 200
    assert "access_token" in form_resp.json()
    assert form_resp.json()["token_type"] == "bearer"
    print("[PASS] Form-encoded login (Swagger Authorize) verified successfully")
    return token

def test_dashboard_apis(token):
    headers = {"Authorization": f"Bearer {token}"}

    # GET /dashboard/me
    resp = client.get("/dashboard/me", headers=headers)
    assert resp.status_code == 200
    data = resp.json()
    assert "id" in data
    assert "email" in data
    assert "name" in data
    print(f"[PASS] GET /dashboard/me: {data['name']} ({data['email']})")

    # GET /dashboard/history
    resp = client.get("/dashboard/history", headers=headers)
    assert resp.status_code == 200
    assert isinstance(resp.json(), list)
    print(f"[PASS] GET /dashboard/history: returned {len(resp.json())} appointments")

    # GET /dashboard/user
    resp = client.get("/dashboard/user", headers=headers)
    assert resp.status_code == 200
    stats = resp.json()
    assert "name" in stats
    assert "email" in stats
    assert "total_appointments" in stats
    assert "total_payments" in stats
    print(f"[PASS] GET /dashboard/user: {stats}")

    # Verify 401 without token
    resp_unauth = client.get("/dashboard/me")
    assert resp_unauth.status_code == 401
    print("[PASS] Unauthenticated access correctly blocked (401)")

def test_payment_apis():
    # POST /payment
    payload = {
        "user_id": 1,
        "appointment_id": 1,
        "amount": 500.0,
        "payment_status": "paid"
    }
    resp = client.post("/payment", json=payload)
    assert resp.status_code == 201
    created = resp.json()
    assert created["amount"] == 500.0
    assert created["payment_status"] == "paid"
    payment_id = created["id"]
    print(f"[PASS] POST /payment created payment ID {payment_id}")

    # GET /payment
    resp = client.get("/payment")
    assert resp.status_code == 200
    payments = resp.json()
    assert isinstance(payments, list)
    assert any(p["id"] == payment_id for p in payments)
    print(f"[PASS] GET /payment returned {len(payments)} payments")

    # GET /payment/{payment_id}
    resp = client.get(f"/payment/{payment_id}")
    assert resp.status_code == 200
    assert resp.json()["id"] == payment_id
    print(f"[PASS] GET /payment/{payment_id} fetched successfully")

    # GET /payment/999999 (Not Found)
    resp = client.get("/payment/999999")
    assert resp.status_code == 404
    print("[PASS] GET /payment/999999 correctly returned 404")

def test_review_apis():
    # POST /review with float rating 4.5
    payload = {
        "user_id": 1,
        "lab_id": 2,
        "rating": 4.5,
        "comment": "Excellent service"
    }
    resp = client.post("/review", json=payload)
    assert resp.status_code == 201
    created = resp.json()
    assert created["rating"] == 4.5
    assert created["comment"] == "Excellent service"
    review_id = created["id"]
    print(f"[PASS] POST /review created review ID {review_id} with rating 4.5")

    # GET /review
    resp = client.get("/review")
    assert resp.status_code == 200
    reviews = resp.json()
    assert isinstance(reviews, list)
    assert any(r["id"] == review_id for r in reviews)
    print(f"[PASS] GET /review returned {len(reviews)} reviews")

    # GET /review/lab/{lab_id}
    resp = client.get("/review/lab/2")
    assert resp.status_code == 200
    lab_reviews = resp.json()
    assert isinstance(lab_reviews, list)
    assert all(r["lab_id"] == 2 for r in lab_reviews)
    print(f"[PASS] GET /review/lab/2 returned {len(lab_reviews)} reviews for lab 2")

def test_search_and_compare_api():
    # Test with test_id = 2 (CBC test which has prices in test_prices table)
    resp = client.get("/compare/2")
    assert resp.status_code == 200
    data = resp.json()
    assert isinstance(data, list)
    assert len(data) > 0
    # Check fields
    first = data[0]
    for key in ["lab_id", "lab_name", "test_name", "price", "rating", "address"]:
        assert key in first, f"Missing key {key} in response"
    
    # Check sort order by price asc
    prices = [item["price"] for item in data]
    assert prices == sorted(prices), f"Prices not sorted ascending: {prices}"
    print(f"[PASS] GET /compare/2 returned sorted prices: {prices}")

    # Non-existent test should return 404
    resp = client.get("/compare/999999")
    assert resp.status_code == 404
    print("[PASS] GET /compare/999999 correctly returned 404")

def test_lab_top_rated():
    # GET /lab/top-rated
    resp = client.get("/lab/top-rated")
    assert resp.status_code == 200
    labs = resp.json()
    assert isinstance(labs, list)
    assert len(labs) <= 10
    ratings = [lab["rating"] for lab in labs]
    assert ratings == sorted(ratings, reverse=True), f"Labs not sorted by rating desc: {ratings}"
    print(f"[PASS] GET /lab/top-rated returned {len(labs)} labs sorted desc by rating: {ratings}")

    # Verify GET /lab/{lab_id} does NOT return 422
    resp = client.get("/lab/2")
    assert resp.status_code == 200
    assert resp.json()["id"] == 2
    print(f"[PASS] GET /lab/2 returned lab without route collision")

if __name__ == "__main__":
    print("Running MedCompare restored backend API tests...\n")
    test_openapi_schema_and_swagger()
    token = test_auth_and_swagger_authorize()
    test_dashboard_apis(token)
    test_payment_apis()
    test_review_apis()
    test_search_and_compare_api()
    test_lab_top_rated()
    print("\nALL TESTS PASSED SUCCESSFULLY! All 8 tasks verified!")
