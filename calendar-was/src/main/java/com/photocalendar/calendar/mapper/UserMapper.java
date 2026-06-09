package com.photocalendar.calendar.mapper;

import org.apache.ibatis.annotations.Mapper;

import com.photocalendar.calendar.domain.User;

@Mapper
public interface UserMapper {

    /** 생성된 PK는 user.id에 채워진다(useGeneratedKeys). */
    int insert(User user);

    User findByEmail(String email);

    User findById(Long id);
}
