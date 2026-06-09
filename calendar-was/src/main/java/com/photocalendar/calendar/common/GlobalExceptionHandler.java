package com.photocalendar.calendar.common;

import java.time.format.DateTimeParseException;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.MissingServletRequestParameterException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;
import org.springframework.web.multipart.MaxUploadSizeExceededException;
import org.springframework.web.multipart.support.MissingServletRequestPartException;

import com.photocalendar.calendar.exception.EmailAlreadyExistsException;
import com.photocalendar.calendar.exception.InvalidCredentialsException;
import com.photocalendar.calendar.exception.NotFoundException;

/**
 * 전역 예외 처리.
 * - 공통(common): 요청 바디 검증 실패(@Valid)·날짜/월 형식 오류·잘못된 인자 → 400, 리소스 없음 → 404
 * - 대상별(target): 인증 도메인 예외 → 409 / 401
 */
@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleValidation(MethodArgumentNotValidException e) {
        String message = e.getBindingResult().getFieldErrors().stream()
                .findFirst()
                .map(fe -> fe.getField() + ": " + fe.getDefaultMessage())
                .orElse("잘못된 요청입니다.");
        return ResponseEntity.badRequest().body(new ErrorResponse("VALIDATION_ERROR", message));
    }

    /** month=YYYY-MM 파싱 실패, {date} 경로 변수 형식 오류 등. */
    @ExceptionHandler({DateTimeParseException.class, MethodArgumentTypeMismatchException.class})
    public ResponseEntity<ErrorResponse> handleBadDate(Exception e) {
        return ResponseEntity.badRequest()
                .body(new ErrorResponse("INVALID_DATE", "날짜 형식이 올바르지 않습니다."));
    }

    /** 잘못된 인자(예: 순서변경 orderedIds 불일치). */
    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ErrorResponse> handleIllegalArgument(IllegalArgumentException e) {
        return ResponseEntity.badRequest().body(new ErrorResponse("BAD_REQUEST", e.getMessage()));
    }

    /**
     * 필수 요청 파라미터/멀티파트 누락(예: month, fit, file).
     * 직접 응답을 써서 sendError → /error 재디스패치(인증 컨텍스트 소실로 401 오인)를 방지.
     */
    @ExceptionHandler({MissingServletRequestParameterException.class,
                       MissingServletRequestPartException.class})
    public ResponseEntity<ErrorResponse> handleMissingParam(Exception e) {
        return ResponseEntity.badRequest().body(new ErrorResponse("MISSING_PARAMETER", e.getMessage()));
    }

    /** 리소스 없음 또는 본인 소유 아님. */
    @ExceptionHandler(NotFoundException.class)
    public ResponseEntity<ErrorResponse> handleNotFound(NotFoundException e) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(new ErrorResponse("NOT_FOUND", e.getMessage()));
    }

    /** 업로드 파일 크기 초과. */
    @ExceptionHandler(MaxUploadSizeExceededException.class)
    public ResponseEntity<ErrorResponse> handleMaxUpload(MaxUploadSizeExceededException e) {
        return ResponseEntity.status(HttpStatus.PAYLOAD_TOO_LARGE)
                .body(new ErrorResponse("FILE_TOO_LARGE", "파일 크기가 허용 한도를 초과했습니다."));
    }

    @ExceptionHandler(EmailAlreadyExistsException.class)
    public ResponseEntity<ErrorResponse> handleEmailExists(EmailAlreadyExistsException e) {
        return ResponseEntity.status(HttpStatus.CONFLICT)
                .body(new ErrorResponse("EMAIL_EXISTS", e.getMessage()));
    }

    @ExceptionHandler(InvalidCredentialsException.class)
    public ResponseEntity<ErrorResponse> handleInvalidCredentials(InvalidCredentialsException e) {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(new ErrorResponse("INVALID_CREDENTIALS", e.getMessage()));
    }
}
