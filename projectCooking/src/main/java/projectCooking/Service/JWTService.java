package projectCooking.Service;

import java.security.Key;
import java.security.NoSuchAlgorithmException;
import java.util.Base64;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.function.Function;

import javax.crypto.KeyGenerator;
import javax.crypto.SecretKey;

import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import projectCooking.Repository.Entity.User;

@Service
public class JWTService {
	// Khóa bí mật cố định (32 bytes = 256 bits) để không bị lỗi khi restart server
	private final String chiakhoa = "5367566B59703373367639792F423F4528482B4D6251655468576D5A71347437";

	public JWTService() {
		// Không generate key ngẫu nhiên nữa
	}

	public String getToken(User user) {
		Map<String, Object> claims = new HashMap<>();
		claims.put("roles", user.getRole().toString());
		claims.put("userId", user.getUserId());

		return Jwts.builder()
				.setClaims(claims)
				.setSubject(user.getUserName())
				.setIssuedAt(new Date(System.currentTimeMillis()))
				.setExpiration(new Date(System.currentTimeMillis() + 60 * 60 * 60 * 60 * 60))
				.signWith(getKey())
				.compact();
	}

	private Key getKey() {
		byte[] keyByte = Decoders.BASE64.decode(chiakhoa);
		return Keys.hmacShaKeyFor(keyByte);
	}

	public String extractUserName(String token) {
		return extractClaim(token, Claims::getSubject);
	}

	public Integer extractUserId(String token) {
		Claims claims = extractAllClaims(token);
		return claims.get("userId", Integer.class);
	}

	public String extractRole(String token) {
		Claims claims = extractAllClaims(token);
		return claims.get("roles", String.class);
	}

	private <T> T extractClaim(String token, Function<Claims, T> claimResolver) {
		final Claims claims = extractAllClaims(token);
		return claimResolver.apply(claims);
	}

	public Claims extractAllClaims(String token) {
		return Jwts.parserBuilder()
				.setSigningKey(getKey())
				.build()
				.parseClaimsJws(token)
				.getBody();
	}

	public boolean validateToken(String token, UserDetails userDetails) {
		final String userName = extractUserName(token);
		return (userName.equals(userDetails.getUsername()) && !isTokenExpired(token));
	}

	private boolean isTokenExpired(String token) {
		return extractExpiration(token).before(new Date());
	}

	private Date extractExpiration(String token) {
		return extractClaim(token, Claims::getExpiration);
	}
}