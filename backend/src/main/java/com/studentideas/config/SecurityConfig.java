package com.studentideas.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

        @Bean
        public PasswordEncoder passwordEncoder() {
                return new BCryptPasswordEncoder();
        }

        @Bean
        public AuthenticationManager authenticationManager(
                        AuthenticationConfiguration config) throws Exception {
                return config.getAuthenticationManager();
        }

        @Bean
        public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
                http
                                .csrf(AbstractHttpConfigurer::disable)
                                .authorizeHttpRequests(auth -> auth
                                                .dispatcherTypeMatchers(jakarta.servlet.DispatcherType.FORWARD,
                                                                jakarta.servlet.DispatcherType.ERROR)
                                                .permitAll()
                                                .requestMatchers("/api/users/register", "/api/users/login",
                                                                "/h2-console/**", "/api/ideas/**", "/api/team/**",
                                                                "/api/comments/**", "/api/communities/**", "/",
                                                                "/login", "/register",
                                                                "/css/**", "/js/**", "/images/**")
                                                .permitAll()
                                                .anyRequest().authenticated())
                                .formLogin(form -> form
                                                .loginPage("/login")
                                                .defaultSuccessUrl("/dashboard", true)
                                                .permitAll())
                                .logout(logout -> logout
                                                .logoutUrl("/logout")
                                                .logoutSuccessUrl("/login?logout")
                                                .permitAll())
                                .headers(headers -> headers.frameOptions(frame -> frame.disable()))
                                .cors(cors -> cors.configurationSource(request -> {
                                        var corsConfiguration = new org.springframework.web.cors.CorsConfiguration();
                                        corsConfiguration.setAllowedOrigins(java.util.List.of("*"));
                                        corsConfiguration.setAllowedMethods(java.util.List.of("*"));
                                        corsConfiguration.setAllowedHeaders(java.util.List.of("*"));
                                        return corsConfiguration;
                                }));

                return http.build();
        }
}
