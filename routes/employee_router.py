from fastapi import APIRouter
from controllers.employee_controller import EmployeeController
from schemas.employee import (
    Employee,
    EmployeeQdrant,
    EmployeeRequest,
    BestEmployeeResponse,
)
from schemas.client import Chat, AnonClientRequest
from typing import List


def create_employee_router(employee_model):
    router = APIRouter()
    controller = EmployeeController(employee_model)

    @router.post("/")
    def create_employee(employee: Employee) -> EmployeeQdrant:
        return controller.create(employee)

    @router.get("/{id}")
    def get_employee(id: str) -> EmployeeQdrant:
        return controller.get(id)

    @router.post("/recommend")
    def recommend_employee(employee_request: EmployeeRequest) -> List[EmployeeQdrant]:
        return controller.recommend(employee_request)

    @router.post("/anon_recommend")
    def anon_recommend(anon_request: AnonClientRequest) -> BestEmployeeResponse:
        return controller.anon_recommend(anon_request)

    return router

