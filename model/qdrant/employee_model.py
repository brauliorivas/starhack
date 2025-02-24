from schemas.employee import (
    Employee,
    EmployeeQdrant,
    EmployeeRequest,
    BestEmployee,
    BestEmployeeResponse,
)
from schemas.client import Chat, AnonClientRequest
from .connection import QdrantConnection
from qdrant_client.models import (
    VectorParams,
    Distance,
    PointStruct,
    Filter,
    FieldCondition,
    MatchValue,
)
from typing import List
from llm.gemini import Gemini
import uuid

qdrant_connection = QdrantConnection().get_connection()
gemini = Gemini()


class EmployeeModel:
    def __init__(self):
        self.collection_name = "employees"

        try:
            qdrant_connection.get_collection(collection_name=self.collection_name)
        except Exception as e:
            qdrant_connection.create_collection(
                collection_name=self.collection_name,
                vectors_config={
                    "background": VectorParams(size=768, distance=Distance.COSINE),
                    "cv": VectorParams(size=768, distance=Distance.COSINE),
                },
            )

    def get(self, id: str) -> EmployeeQdrant:
        points = qdrant_connection.retrieve(
            collection_name=self.collection_name,
            ids=[id],
            with_payload=True,
            with_vectors=True,
        )

        point = points[0]

        id = point.id
        payload = point.payload
        name = payload.get("name")
        skillset = payload.get("skillset")
        background = payload.get("background")

        employee = EmployeeQdrant(
            id=id,
            name=name,
            skillset=skillset,
            background=background,
            background_vector=point.vector.get("background"),
            cv_vector=point.vector.get("cv"),
        )

        return employee

    def create(self, employee: Employee) -> EmployeeQdrant:
        id = str(uuid.uuid4())
        embedding_background = gemini.embed_document(employee.background)
        embedding_cv = gemini.embed_document(employee.cv)
        payload = {
            "name": employee.name,
            "skillset": employee.skillset,
            "background": employee.background,
        }

        struct = PointStruct(
            id=id,
            payload=payload,
            vector={"background": embedding_background, "cv": embedding_cv},
        )

        points = [struct]

        qdrant_connection.upsert(self.collection_name, points)

        return self.get(id)

    def recommend(self, employee_request: EmployeeRequest) -> List[EmployeeQdrant]:
        chat = employee_request.chat
        background = employee_request.background
        skillset = employee_request.skillset

        messages = chat.messages
        user_messages = [
            message.get("parts")[0]
            for message in messages
            if message.get("role") == "user"
        ]
        user_messages = user_messages[1:]  # Remove the first message from the user
        text = " ".join(user_messages)

        requirements_text = gemini.embed_query(text)

        search_by_cv = qdrant_connection.search(
            collection_name=self.collection_name,
            query_filter=Filter(
                should=[
                    FieldCondition(key="skillset[]", match=MatchValue(value=skill))
                    for skill in skillset
                ]
            ),
            query_vector=("cv", requirements_text),
            with_vectors=True,
            with_payload=True,
        )

        search_by_background = qdrant_connection.search(
            collection_name=self.collection_name,
            query_filter=Filter(
                should=[
                    FieldCondition(key="skillset[]", match=MatchValue(value=skill))
                    for skill in skillset
                ]
            ),
            query_vector=("background", background),
            with_vectors=True,
            with_payload=True,
        )

        results = []

        for employee in search_by_cv:
            employee_cv_score = employee.score
            employee_background_score = [
                employee
                for employee in search_by_background
                if employee.id == employee.id
            ][0].score
            e = EmployeeQdrant(
                id=employee.id,
                name=employee.payload.get("name"),
                skillset=employee.payload.get("skillset"),
                background=employee.payload.get("background"),
                background_vector=employee.vector.get("background"),
                cv_vector=employee.vector.get("cv"),
                score_cv=employee_cv_score,
                score_background=employee_background_score,
            )
            results.append(e)

        return results

    def anon_recommend(
        self, anon_recommend_request: AnonClientRequest
    ) -> BestEmployeeResponse:
        print(anon_recommend_request)
        message = anon_recommend_request.message

        requirements_embedd = gemini.embed_query(message)

        search_by_cv = qdrant_connection.search(
            collection_name=self.collection_name,
            query_vector=("cv", requirements_embedd),
            with_vectors=True,
            with_payload=True,
        )

        results = []

        for employee in search_by_cv:
            employee_cv_score = employee.score
            e = BestEmployee(
                name=employee.payload.get("name"),
                score=employee_cv_score,
                background=employee.payload.get("background"),
            )
            results.append(e)

        results.sort(key=lambda e: e.score)

        best_employee = None

        if len(results) > 0:
            best_employee = results[0]

        if best_employee:
            messages = [
                {
                    "role": "user",
                    "parts": "Hey, I'm going to pass the profile of a business. This business is about {}. The name is {}, The score that this business got is {}. Your task is to why this business is the best for my needs because of their background and the score that it got is the one I told you.".format(
                        best_employee.background,
                        best_employee.name,
                        best_employee.score,
                    ),
                }
            ]
            res = gemini.chat(messages)
            print(res)
            gemini_answer = res[1]["parts"][0]
            return BestEmployeeResponse(answer=gemini_answer)
        else:
            return BestEmployeeResponse(
                "Sorry, I wasn't able to find a good match for you\n"
            )

        return

