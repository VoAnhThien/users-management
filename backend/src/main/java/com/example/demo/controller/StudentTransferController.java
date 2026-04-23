package com.example.demo.controller;

import java.security.Principal;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.dto.TransferRequestDTO;
import com.example.demo.entity.TransferRequest;
import com.example.demo.service.TrasferRequestService;

@RestController
@RequestMapping("/api/transfer")
public class StudentTransferController {
    @Autowired
    private TrasferRequestService trasferRequestService;

    @PostMapping("/submit")
    public ResponseEntity<?> submitTransferRequest(
        Principal principal,
        @RequestBody TransferRequestDTO tRequestDTO
    ){
        if(principal==null){
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Vui long dang nhap");
        }
        try{
            String username=principal.getName();
            TransferRequest phieu = trasferRequestService.createRequest(
                username,
                tRequestDTO.getMalopmoi(),
                tRequestDTO.getReason());
            return ResponseEntity.ok(phieu);
        }catch(RuntimeException e){
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
