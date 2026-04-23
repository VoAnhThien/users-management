package com.example.demo;

import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.security.crypto.password.PasswordEncoder;

import com.example.demo.repository.UserRepository;
import com.example.demo.entity.User;

@SpringBootApplication
public class BackendXdpmwebApplication {

	public static void main(String[] args) {
		SpringApplication.run(BackendXdpmwebApplication.class, args);
	}
    @Bean
CommandLineRunner initDatabase(UserRepository repository, PasswordEncoder passwordEncoder) {
    return args -> {
        if (repository.count() == 0) {           
            User user2 = new User();
            user2.setName("Le Thi B");
            user2.setUsername("lethib");
            user2.setPassword(passwordEncoder.encode("password456"));
            user2.setRole("ROLE_ADMIN");
            repository.save(user2);
        }
    };
}
}

