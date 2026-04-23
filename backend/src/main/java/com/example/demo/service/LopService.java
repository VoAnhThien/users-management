package com.example.demo.service;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.demo.entity.Lop;
import com.example.demo.repository.LopRepository;

@Service
public class LopService {
    @Autowired
    private LopRepository lopRepository;

    public List<Lop> getAllLops() {
        return lopRepository.findAll();
    }

    public Optional<Lop> getLopById(String id) {
        return lopRepository.findById(id);
    }
    public Lop createLop(Lop lop) {
        if(lopRepository.existsById(lop.getMalop())){
            throw new RuntimeException("Ma lop da ton tai");
        }
        return lopRepository.save(lop);
    }
    public void deleteLop(String id) {
        lopRepository.deleteById(id);
    }
    public Lop updateLop(String id, Lop lopDetails) {
        Optional<Lop> lop = lopRepository.findById(id);
        if (lop.isPresent()) {
            Lop existingLop = lop.get();
            existingLop.setTenlop(lopDetails.getTenlop());
            return lopRepository.save(existingLop);
        }
        return null;
    }
}
