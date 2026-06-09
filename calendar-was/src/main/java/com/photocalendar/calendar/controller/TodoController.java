package com.photocalendar.calendar.controller;

import java.time.LocalDate;
import java.util.List;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.photocalendar.calendar.dto.TodoCreateRequest;
import com.photocalendar.calendar.dto.TodoOrderRequest;
import com.photocalendar.calendar.dto.TodoResponse;
import com.photocalendar.calendar.dto.TodoUpdateRequest;
import com.photocalendar.calendar.security.SecurityUtil;
import com.photocalendar.calendar.service.TodoService;

import jakarta.validation.Valid;

@RestController
public class TodoController {

    private final TodoService todoService;

    public TodoController(TodoService todoService) {
        this.todoService = todoService;
    }

    /** 추가(day_entry 없으면 자동 생성). */
    @PostMapping("/api/entries/{date}/todos")
    @ResponseStatus(HttpStatus.CREATED)
    public TodoResponse add(
            @PathVariable @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @Valid @RequestBody TodoCreateRequest request) {
        return todoService.addTodo(SecurityUtil.currentUserId(), date, request.getContent());
    }

    /** 내용/완료 부분 수정. */
    @PatchMapping("/api/todos/{id}")
    public TodoResponse update(@PathVariable Long id,
                              @Valid @RequestBody TodoUpdateRequest request) {
        return todoService.updateTodo(SecurityUtil.currentUserId(), id, request);
    }

    /** 삭제. */
    @DeleteMapping("/api/todos/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        todoService.deleteTodo(SecurityUtil.currentUserId(), id);
    }

    /** 순서 재배치(전체 id 배열). */
    @PutMapping("/api/entries/{date}/todos/order")
    public List<TodoResponse> reorder(
            @PathVariable @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @Valid @RequestBody TodoOrderRequest request) {
        return todoService.reorder(SecurityUtil.currentUserId(), date, request.getOrderedIds());
    }
}
