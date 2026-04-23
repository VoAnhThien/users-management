package com.example.demo.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.entity.MonHoc;
import com.example.demo.service.MonHocService;

@RestController
@RequestMapping("/api/monhocs")
public class MonHocController {
    @Autowired
    private MonHocService monHocService;

    @GetMapping
    public ResponseEntity<List<MonHoc>> getAll(){
        return ResponseEntity.ok(monHocService.getAllMonHocs());
    }

    @PostMapping
    public ResponseEntity<MonHoc> createMonHoc(@RequestBody MonHoc monHoc){
        return ResponseEntity.ok(monHocService.createMonHoc(monHoc));
    }
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteMonHoc(@PathVariable String id){
        monHocService.deleteMonHoc(id);
        return ResponseEntity.noContent().build();
    }
    @PutMapping("/{id}")
    public ResponseEntity<MonHoc> updateMonHoc(@PathVariable String id, @RequestBody MonHoc monHocDetails){
        MonHoc updatedMonHoc = monHocService.updateMonHoc(id, monHocDetails);
        if (updatedMonHoc != null) {
            return ResponseEntity.ok(updatedMonHoc);
        }
        return ResponseEntity.notFound().build();
    }
    
}
