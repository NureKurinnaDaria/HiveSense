from locust import HttpUser, task, between

class HiveSenseUser(HttpUser):
    wait_time = between(0.1, 0.5)
    token = None

    def on_start(self):
        response = self.client.post(
            "/auth/login",
            json={"email": "admin@hivesense.com", "password": "password"},
            name="POST /auth/login"
        )
        if response.status_code in (200, 201):
            self.token = response.json().get("access_token")

    def get_headers(self):
        if self.token:
            return {"Authorization": f"Bearer {self.token}"}
        return {}

    @task(5)
    def get_measurements(self):
        self.client.get("/measurements", headers=self.get_headers(), name="GET /measurements")

    @task(4)
    def get_sensors(self):
        self.client.get("/sensors", headers=self.get_headers(), name="GET /sensors")

    @task(4)
    def get_alerts(self):
        self.client.get("/alerts", headers=self.get_headers(), name="GET /alerts")

    @task(3)
    def get_honey_batches(self):
        self.client.get("/honey-batches", headers=self.get_headers(), name="GET /honey-batches")

    @task(2)
    def get_warehouses(self):
        self.client.get("/warehouses", headers=self.get_headers(), name="GET /warehouses")