/*
 * file: backend/src/main/java/com/company/ptsm/security/jwt/JwtService.java
 *
 * (CẢI TIẾN)
 * Dịch vụ tạo và giải mã JSON Web Tokens (JWT).
 */
package com.company.ptsm.security.jwt;

import com.company.ptsm.model.User;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import java.security.Key;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.function.Function;

@Service
public class JwtService {

    // Đọc 2 giá trị này từ file application.properties
    @Value("${jwt.secret-key}")
    private String secretKey;

    @Value("${jwt.expiration-time}")
    private long expirationTime;

    /**
     * Trích xuất username (email) từ token.
     */
    public String extractUsername(String token) {
        return extractClaim(token, Claims::getSubject); // Subject chính là email
    }

    /**
     * Hàm trích xuất một "claim" (thông tin) bất kỳ từ token.
     */
    public <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = extractAllClaims(token);
        return claimsResolver.apply(claims);
    }

    /**
     * Tạo token mới chỉ dựa trên UserDetails (không có claims phụ).
     */
    public String generateToken(UserDetails userDetails) {
        // [CẢI TIẾN] Gọi hàm generateToken với claims phụ
        // để lưu thêm role, id, branchId vào token

        Map<String, Object> extraClaims = new HashMap<>();
        if (userDetails instanceof User) {
            User user = (User) userDetails;
            extraClaims.put("role", user.getRole().name());
            extraClaims.put("userId", user.getId());
            if (user.getBranch() != null) {
                extraClaims.put("branchId", user.getBranch().getId());
            }
        }

        return generateToken(extraClaims, userDetails);
    }

    /**
     * Tạo token mới với các claims phụ (ví dụ: role, id).
     * Đây là hàm chính để tạo token.
     */
    public String generateToken(
            Map<String, Object> extraClaims,
            UserDetails userDetails) {
        return Jwts.builder()
                .setClaims(extraClaims) // Thêm các claims phụ
                .setSubject(userDetails.getUsername()) // Subject là email
                .setIssuedAt(new Date(System.currentTimeMillis())) // Thời gian phát hành
                .setExpiration(new Date(System.currentTimeMillis() + expirationTime)) // Thời gian hết hạn
                .signWith(getSignInKey(), SignatureAlgorithm.HS256) // Ký token
                .compact();
    }

    /**
     * Kiểm tra xem token có hợp lệ không.
     */
    public boolean isTokenValid(String token, UserDetails userDetails) {
        final String username = extractUsername(token);
        return (username.equals(userDetails.getUsername())) && !isTokenExpired(token);
    }

    /**
     * Kiểm tra token đã hết hạn chưa.
     */
    private boolean isTokenExpired(String token) {
        return extractExpiration(token).before(new Date());
    }

    /**
     * Lấy thời gian hết hạn từ token.
     */
    private Date extractExpiration(String token) {
        return extractClaim(token, Claims::getExpiration);
    }

    /**
     * Giải mã toàn bộ token để lấy tất cả claims.
     */
    private Claims extractAllClaims(String token) {
        return Jwts
                .parserBuilder()
                .setSigningKey(getSignInKey())
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

    /**
     * Lấy Key (khóa) dùng để ký từ chuỗi secret (Base64).
     */
    private Key getSignInKey() {
        byte[] keyBytes = Decoders.BASE64.decode(secretKey);
        return Keys.hmacShaKeyFor(keyBytes);
    }
}