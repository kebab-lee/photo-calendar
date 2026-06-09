package com.photocalendar.calendar.service;

import java.time.LocalDate;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.photocalendar.calendar.domain.DayEntry;
import com.photocalendar.calendar.domain.Todo;
import com.photocalendar.calendar.dto.TodoResponse;
import com.photocalendar.calendar.dto.TodoUpdateRequest;
import com.photocalendar.calendar.exception.NotFoundException;
import com.photocalendar.calendar.mapper.DayEntryMapper;
import com.photocalendar.calendar.mapper.TodoMapper;

@Service
public class TodoService {

    private final TodoMapper todoMapper;
    private final DayEntryMapper dayEntryMapper;

    public TodoService(TodoMapper todoMapper, DayEntryMapper dayEntryMapper) {
        this.todoMapper = todoMapper;
        this.dayEntryMapper = dayEntryMapper;
    }

    /** 추가. day_entry 없으면 자동 생성(todo는 정당한 첫 쓰기). sort_order는 맨 뒤로. */
    @Transactional
    public TodoResponse addTodo(Long userId, LocalDate date, String content) {
        DayEntry entry = getOrCreateEntry(userId, date);
        Integer max = todoMapper.maxSortOrder(entry.getId());
        int nextOrder = (max == null) ? 0 : max + 1;

        Todo todo = new Todo();
        todo.setDayEntryId(entry.getId());
        todo.setContent(content);
        todo.setIsDone(false);
        todo.setSortOrder(nextOrder);
        todoMapper.insert(todo);
        return toResponse(todo);
    }

    /** 부분 수정. null 아닌 필드만 반영. 본인 소유가 아니면 404. */
    @Transactional
    public TodoResponse updateTodo(Long userId, Long id, TodoUpdateRequest request) {
        Todo todo = requireOwnedTodo(userId, id);
        if (request.getContent() != null) {
            todo.setContent(request.getContent());
        }
        if (request.getIsDone() != null) {
            todo.setIsDone(request.getIsDone());
        }
        todoMapper.update(todo);
        return toResponse(todo);
    }

    /** 삭제. 본인 소유가 아니면 404. */
    @Transactional
    public void deleteTodo(Long userId, Long id) {
        requireOwnedTodo(userId, id);
        todoMapper.deleteById(id);
    }

    /**
     * 순서 재배치. orderedIds가 해당 날짜 엔트리의 todo 집합과 정확히 일치해야 함
     * (외부/누락/중복 id → 400). 일치 시 0,1,2…로 재부여.
     */
    @Transactional
    public List<TodoResponse> reorder(Long userId, LocalDate date, List<Long> orderedIds) {
        DayEntry entry = dayEntryMapper.findByUserIdAndEntryDate(userId, date);
        if (entry == null) {
            throw new NotFoundException("해당 날짜의 항목을 찾을 수 없습니다.");
        }
        List<Todo> current = todoMapper.findByDayEntryId(entry.getId());
        Set<Long> currentIds = new HashSet<>();
        for (Todo t : current) {
            currentIds.add(t.getId());
        }
        Set<Long> requestedIds = new HashSet<>(orderedIds);
        if (requestedIds.size() != orderedIds.size() || !requestedIds.equals(currentIds)) {
            throw new IllegalArgumentException("orderedIds가 해당 날짜의 할 일 목록과 일치하지 않습니다.");
        }
        for (int i = 0; i < orderedIds.size(); i++) {
            todoMapper.updateSortOrder(orderedIds.get(i), i);
        }
        return todoMapper.findByDayEntryId(entry.getId()).stream().map(this::toResponse).toList();
    }

    private DayEntry getOrCreateEntry(Long userId, LocalDate date) {
        DayEntry entry = dayEntryMapper.findByUserIdAndEntryDate(userId, date);
        if (entry != null) {
            return entry;
        }
        DayEntry created = new DayEntry();
        created.setUserId(userId);
        created.setEntryDate(date);
        dayEntryMapper.insert(created);
        return created;
    }

    private Todo requireOwnedTodo(Long userId, Long id) {
        Todo todo = todoMapper.findByIdAndUserId(id, userId);
        if (todo == null) {
            throw new NotFoundException("할 일을 찾을 수 없습니다.");
        }
        return todo;
    }

    private TodoResponse toResponse(Todo t) {
        return new TodoResponse(t.getId(), t.getContent(), t.getIsDone(), t.getSortOrder());
    }
}
