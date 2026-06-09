package com.photocalendar.calendar.security;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

/** SecurityContext에서 현재 사용자 id를 꺼내는 공통 유틸. 데이터 API에서 "본인 데이터만" 처리할 때 재사용. */
public final class SecurityUtil {

    private SecurityUtil() {
    }

    /** 현재 인증된 사용자 id. 인증 컨텍스트가 없으면 null. */
    public static Long currentUserId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !(auth.getPrincipal() instanceof Long userId)) {
            return null;
        }
        return userId;
    }
}
