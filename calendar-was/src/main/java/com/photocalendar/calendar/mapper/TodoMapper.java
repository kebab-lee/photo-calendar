package com.photocalendar.calendar.mapper;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import com.photocalendar.calendar.domain.Todo;

@Mapper
public interface TodoMapper {

    /** sort_order ASC. */
    List<Todo> findByDayEntryId(Long dayEntryId);

    /** 소유권 포함 조회(todo→day_entry→user_id). 본인 소유가 아니면 null. */
    Todo findByIdAndUserId(@Param("id") Long id, @Param("userId") Long userId);

    /** 생성된 PK는 todo.id에 채워진다(useGeneratedKeys). */
    int insert(Todo todo);

    /** content / is_done 수정. */
    int update(Todo todo);

    int deleteById(Long id);

    /** 순서 재배치: 서비스가 orderedIds를 돌며 0,1,2…로 호출. */
    int updateSortOrder(@Param("id") Long id, @Param("sortOrder") int sortOrder);

    /** 새 todo append 위치 계산용. 없으면 null. */
    Integer maxSortOrder(Long dayEntryId);
}
