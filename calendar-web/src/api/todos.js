import client from './client.js';

/** 추가. → 생성된 { id, content, isDone, sortOrder } */
export async function addTodo(date, content) {
  const { data } = await client.post(`/entries/${date}/todos`, { content });
  return data;
}

/** 부분 수정(content?/isDone?). → 갱신된 TodoResponse */
export async function updateTodo(id, patch) {
  const { data } = await client.patch(`/todos/${id}`, patch);
  return data;
}

/** 삭제. */
export async function deleteTodo(id) {
  await client.delete(`/todos/${id}`);
}

/** 순서 재배치(전체 id 배열). → 재정렬된 TodoResponse[] */
export async function reorderTodos(date, orderedIds) {
  const { data } = await client.put(`/entries/${date}/todos/order`, { orderedIds });
  return data;
}
