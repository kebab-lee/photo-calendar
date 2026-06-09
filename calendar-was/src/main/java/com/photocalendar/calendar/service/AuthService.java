package com.photocalendar.calendar.service;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.photocalendar.calendar.domain.User;
import com.photocalendar.calendar.dto.LoginRequest;
import com.photocalendar.calendar.dto.MeResponse;
import com.photocalendar.calendar.dto.SignupRequest;
import com.photocalendar.calendar.dto.TokenResponse;
import com.photocalendar.calendar.exception.EmailAlreadyExistsException;
import com.photocalendar.calendar.exception.InvalidCredentialsException;
import com.photocalendar.calendar.mapper.UserMapper;
import com.photocalendar.calendar.security.JwtTokenProvider;

@Service
public class AuthService {

    private final UserMapper userMapper;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider tokenProvider;

    public AuthService(UserMapper userMapper, PasswordEncoder passwordEncoder,
                       JwtTokenProvider tokenProvider) {
        this.userMapper = userMapper;
        this.passwordEncoder = passwordEncoder;
        this.tokenProvider = tokenProvider;
    }

    @Transactional
    public MeResponse signup(SignupRequest request) {
        if (userMapper.findByEmail(request.getEmail()) != null) {
            throw new EmailAlreadyExistsException("이미 사용 중인 이메일입니다.");
        }
        User user = new User();
        user.setEmail(request.getEmail());
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        userMapper.insert(user);
        return new MeResponse(user.getId(), user.getEmail());
    }

    public TokenResponse login(LoginRequest request) {
        User user = userMapper.findByEmail(request.getEmail());
        if (user == null || !passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new InvalidCredentialsException("이메일 또는 비밀번호가 올바르지 않습니다.");
        }
        return new TokenResponse(tokenProvider.createToken(user.getId()));
    }

    public MeResponse me(Long userId) {
        User user = userMapper.findById(userId);
        if (user == null) {
            throw new InvalidCredentialsException("사용자를 찾을 수 없습니다.");
        }
        return new MeResponse(user.getId(), user.getEmail());
    }
}
