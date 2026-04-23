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

import com.example.demo.entity.Lop;
import com.example.demo.service.LopService;

@RestController
@RequestMapping("/api/lops")
public class LopController {
    @Autowired
    private LopService lopService;

    @GetMapping
    public ResponseEntity<List<Lop>> getAll(){
        return ResponseEntity.ok(lopService.getAllLops());
    }

    @PostMapping
    public ResponseEntity<Lop> createLop(@RequestBody Lop lop){
        return ResponseEntity.ok(lopService.createLop(lop));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteLop(@PathVariable String id){
        lopService.deleteLop(id);
        return ResponseEntity.noContent().build();
    }
    @PutMapping("/{id}")
    public ResponseEntity<Lop> updateLop(@PathVariable String id, @RequestBody Lop lopDetails){
        Lop updatedLop = lopService.updateLop(id, lopDetails);
        if (updatedLop != null) {
            return ResponseEntity.ok(updatedLop);
        }
        return ResponseEntity.notFound().build();
    }
}
