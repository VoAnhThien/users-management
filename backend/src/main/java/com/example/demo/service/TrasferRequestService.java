package com.example.demo.service;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.demo.entity.Lop;
import com.example.demo.entity.SinhVien;
import com.example.demo.entity.TransferRequest;
import com.example.demo.repository.LopRepository;
import com.example.demo.repository.StudentRepository;
import com.example.demo.repository.TransferRequestRepository;

@Service
public class TrasferRequestService {
    @Autowired
    private TransferRequestRepository transferRequestRepository;
    @Autowired
    private StudentRepository studentRepository;
    @Autowired
    private LopRepository lopRepository;

    @Transactional
    public TransferRequest createRequest(String username, String malopmoi, String reason){
        SinhVien sv = studentRepository.findByUserUsername(username)
                .orElseThrow(()-> new RuntimeException("Khong tim thay sinh vien"));
        TransferRequest request = new TransferRequest();
        request.setId(sv.getMssv()+LocalDateTime.now());
        request.setSinhVienT(sv);
        if(sv.getLop()!=null){
            request.setMalopcu(sv.getLop().getMalop());
        }
        request.setMalopmoi(malopmoi);
        request.setReason(reason);
        request.setStatus("PENDING");
        request.setCreateAt(LocalDateTime.now());
        return transferRequestRepository.save(request);
    }

    @Transactional
    public void approveRequest(String resId){
        TransferRequest tRequest= transferRequestRepository.findById(resId)
            .orElseThrow(()-> new RuntimeException("yeu cau khong ton tai"));
        if(tRequest.getStatus().equals("PENDING")){
            SinhVien sinhVien=tRequest.getSinhVienT();
            Lop lop=lopRepository.findById(tRequest.getMalopmoi()).get();
            if(lop!=null){
                sinhVien.setLop(lop);
                studentRepository.save(sinhVien);
                tRequest.setStatus("APPROVED");
                transferRequestRepository.save(tRequest);
            }else{
                throw new RuntimeException("Khong ton tai ma lop moi");          
            }
        }
    }

    public List<TransferRequest> getAllPendingRequest(){
        return transferRequestRepository.findByStatus("PENDING");
    }
}