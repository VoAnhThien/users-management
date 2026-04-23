package com.example.demo.controller;

import com.example.demo.entity.User;
import com.example.demo.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("") // Định nghĩa tiền tố đường dẫn
public class UserController {

    @Autowired
    private UserRepository userRepository;

    @GetMapping("/users") // Kết hợp lại thành /users
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }
    @GetMapping("/users/{id}") // Kết hợp lại thành /users/{id}
    public User getUserById(@PathVariable Long id) {
        return userRepository.findById(id).orElse(null);
    }
    @DeleteMapping("/users/{id}")
    public void deleteUser(@PathVariable long id){
        userRepository.deleteById(id);
    }
}