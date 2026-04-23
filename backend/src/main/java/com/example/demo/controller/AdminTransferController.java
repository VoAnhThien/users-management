package com.example.demo.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.entity.TransferRequest;
import com.example.demo.service.TrasferRequestService;

@RestController
@RequestMapping("/api/transfer")
public class AdminTransferController {
    @Autowired
    private TrasferRequestService trasferRequestService;
    

    @GetMapping("/pending")
    public ResponseEntity<List<TransferRequest>> getPedingRequest(){
        return ResponseEntity.ok(trasferRequestService.getAllPendingRequest());
    }

    @PutMapping("approve/{id}")
    public ResponseEntity<?> approveRequest(@PathVariable String id){
        try{
            trasferRequestService.approveRequest(id);
            return ResponseEntity.ok("Da thuc hien chuyen lop thanh cong!");
        }catch(RuntimeException e){
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
