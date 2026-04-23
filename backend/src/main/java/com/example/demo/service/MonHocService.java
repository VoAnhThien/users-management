package com.example.demo.service;

import java.util.List;

import java.util.Optional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.demo.entity.MonHoc;
import com.example.demo.repository.MonHocRepository;

@Service
public class MonHocService {
    @Autowired
    private MonHocRepository monHocRepository;
    
    public List<MonHoc> getAllMonHocs() {
        return monHocRepository.findAll();
    }
    public Optional<MonHoc> getMonHocById(String id) {
        return monHocRepository.findById(id);
    }
    public MonHoc createMonHoc(MonHoc monHoc) {
        if(monHocRepository.existsById(monHoc.getMamh())){
            throw new RuntimeException("Ma mon hoc da ton tai");
        }
        return monHocRepository.save(monHoc);
    }
    public void deleteMonHoc(String id) {
        monHocRepository.deleteById(id);
    }
    public MonHoc updateMonHoc(String id, MonHoc monHocDetails) {
        Optional<MonHoc> monHoc = monHocRepository.findById(id);
        if (monHoc.isPresent()) {
            MonHoc updatedMonHoc = monHoc.get();
            updatedMonHoc.setMamh(monHocDetails.getMamh());
            updatedMonHoc.setTenmh(monHocDetails.getTenmh());
            updatedMonHoc.setSotietlt(monHocDetails.getSotietlt());
            updatedMonHoc.setSotietth(monHocDetails.getSotietth());
            return monHocRepository.save(updatedMonHoc);
        }
        throw new RuntimeException("MonHoc not found with id: " + id);
    }
}
