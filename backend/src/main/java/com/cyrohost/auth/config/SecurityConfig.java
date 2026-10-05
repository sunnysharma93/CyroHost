package com.cyrohost.auth.config;

import com.cyrohost.auth.dto.ErrorBody;
import com.cyrohost.auth.repository.RefreshSessionRepository;
import com.cyrohost.auth.repository.UserRepository;
import com.cyrohost.auth.security.AccessTokenFilter;
import com.cyrohost.auth.security.AuthCookies;
import com.cyrohost.auth.security.CsrfCookieFilter;
import com.cyrohost.console.repository.AccountMemberRepository;
import com.cyrohost.console.repository.ApiTokenRepository;
import com.cyrohost.auth.security.JwtService;
import com.cyrohost.console.security.ApiTokenFilter;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
public class SecurityConfig {

    @Bean
    PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder(12);
    }

    @Bean
    CorsConfigurationSource corsConfigurationSource(AuthProperties properties) {
        CorsConfiguration cors = new CorsConfiguration();
        cors.setAllowedOrigins(List.of(properties.frontendOrigin()));
        cors.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        cors.setAllowedHeaders(List.of("Content-Type", "X-CSRF-Token"));
        cors.setAllowCredentials(true);
        cors.setMaxAge(3600L);
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/api/**", cors);
        return source;
    }

    @Bean
    SecurityFilterChain securityFilterChain(
            HttpSecurity http,
            AuthCookies cookies,
            ObjectMapper json,
            JwtService jwtService,
            RefreshSessionRepository sessions,
            UserRepository users,
            ApiTokenRepository tokens,
            AccountMemberRepository members
    ) throws Exception {
        http
                .csrf(AbstractHttpConfigurer::disable)
                .cors(cors -> {})
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .formLogin(AbstractHttpConfigurer::disable)
                .httpBasic(AbstractHttpConfigurer::disable)
                .logout(AbstractHttpConfigurer::disable)
                .anonymous(AbstractHttpConfigurer::disable)
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/auth/csrf", "/api/auth/oauth/providers").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/auth/oauth/*/start", "/api/auth/oauth/*/callback").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/auth/register", "/api/auth/login", "/api/auth/logout", "/api/auth/refresh", "/api/auth/forgot-password", "/api/auth/reset-password").permitAll()
                        .requestMatchers("/actuator/health", "/actuator/health/**", "/actuator/info").permitAll()
                        .requestMatchers("/api/admin/**").hasRole("ADMIN")
                        .anyRequest().authenticated()
                )
                .exceptionHandling(errors -> errors
                        .authenticationEntryPoint((request, response, exception) -> write(response, HttpServletResponse.SC_UNAUTHORIZED, json, "unauthorized", "Sign in to continue."))
                        .accessDeniedHandler((request, response, exception) -> write(response, HttpServletResponse.SC_FORBIDDEN, json, "forbidden", "You cannot open that resource."))
                )
                .addFilterBefore(new CsrfCookieFilter(cookies, json), UsernamePasswordAuthenticationFilter.class)
                .addFilterBefore(new AccessTokenFilter(jwtService, cookies, sessions, users), UsernamePasswordAuthenticationFilter.class)
                .addFilterAfter(new ApiTokenFilter(tokens, members), AccessTokenFilter.class);
        return http.build();
    }

    private static void write(HttpServletResponse response, int status, ObjectMapper json, String code, String message) throws java.io.IOException {
        response.setStatus(status);
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        json.writeValue(response.getWriter(), new ErrorBody(code, message));
    }
}
