package com.example.demo.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.builders.AuthenticationManagerBuilder;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.http.HttpMethod;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import com.example.demo.service.CustomUserDetailService;

import jakarta.servlet.http.HttpServletResponse;

import static org.springframework.security.config.Customizer.withDefaults;

import java.util.Arrays;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    private final CustomUserDetailService userDetailsService;

    public SecurityConfig(CustomUserDetailService userDetailsService) {
        this.userDetailsService = userDetailsService;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .cors(withDefaults())
            .csrf(csrf -> csrf.disable())
            .sessionManagement(session -> session
                .sessionCreationPolicy(SessionCreationPolicy.IF_REQUIRED))
            .authorizeHttpRequests(auth -> auth
                //endpoint nào không cần xác thực thì thêm vào đây
                .requestMatchers("/api/auth/**").permitAll()
                .requestMatchers("/users/**").permitAll()
                .requestMatchers("/api/transfer/**").hasAnyRole("USER","ADMIN")
                //phân quyền cho sinh viên
                .requestMatchers(HttpMethod.GET, "/api/students/**").hasAnyRole("USER", "ADMIN")
                .requestMatchers("/api/students/**").hasRole("ADMIN")
                //phân quyền cho môn học
                .requestMatchers(HttpMethod.GET, "/api/monhocs/**").hasAnyRole("USER", "ADMIN")
                .requestMatchers("/api/monhocs/**").hasRole("ADMIN")
                //phân quyền cho lớp
                .requestMatchers(HttpMethod.GET, "/api/lops/**").hasAnyRole("USER", "ADMIN")
                .requestMatchers("/api/lops/**").hasRole("ADMIN")
                //phân quyền cho điểm 
                .requestMatchers(HttpMethod.GET, "/api/grades/**").hasAnyRole("USER", "ADMIN")
                .requestMatchers("/api/grades/**").hasRole("ADMIN")
                .anyRequest().authenticated()
            )
            .httpBasic(basic -> basic.authenticationEntryPoint((request,response, authException)->{
                response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);     ;
                response.setContentType("application/json");
                response.getWriter().write("{\"error\": \"Unauthorized\", \"message\": \"" + authException.getMessage() + "\"}");
            }))
            .exceptionHandling(ex -> ex.accessDeniedHandler((request,response,accessDeniedExeption)->{
                response.setStatus(HttpServletResponse.SC_FORBIDDEN);
                response.setContentType("application/json");
                response.getWriter().write("{\"error\": \"Forbidden\", \"message\": \"Ban khong co quyen truy cap!\"}");
            }));
        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        
        // Cho phép tất cả các nguồn
        configuration.setAllowedOriginPatterns(Arrays.asList("*")); 
        
        // Cho phép tất cả các phương thức (GET, POST, PUT, DELETE,...)
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        
        // Cho phép tất cả các headers
        configuration.setAllowedHeaders(Arrays.asList("*"));
        
        // Cho phép gửi credentials (token, cookies) từ nguồn lạ
        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    @Bean
    public AuthenticationManager authenticationManager(HttpSecurity http) throws Exception {
        AuthenticationManagerBuilder authenticationManagerBuilder = 
            http.getSharedObject(AuthenticationManagerBuilder.class);
        authenticationManagerBuilder
                .userDetailsService(userDetailsService)
                .passwordEncoder(passwordEncoder());
        return authenticationManagerBuilder.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}