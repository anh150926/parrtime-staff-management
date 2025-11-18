/*
 * file: backend/src/main/java/com/company/ptsm/security/service/UserDetailsServiceImpl.java
 *
 * [CẢI TIẾN]
 * Giúp Spring Security tìm User (thay vì Employee) trong database.
 */
package com.company.ptsm.security.service;

import com.company.ptsm.repository.UserRepository; // <-- [CẢI TIẾN] Thay đổi import
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class UserDetailsServiceImpl implements UserDetailsService {

    private final UserRepository userRepository; // <-- [CẢI TIẾN] Dùng UserRepository

    /**
     * Spring Security sẽ gọi hàm này khi user cố gắng đăng nhập.
     * 
     * @param username (Chính là email)
     * @return UserDetails (chính là object User của chúng ta)
     */
    @Override
    @Transactional(readOnly = true) // Chỉ đọc
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        // Tìm user bằng email
        return userRepository.findByEmail(username)
                .orElseThrow(() -> new UsernameNotFoundException("Không tìm thấy người dùng với email: " + username));

        // Vì User implement UserDetails, chúng ta có thể trả về nó trực tiếp.
    }
}