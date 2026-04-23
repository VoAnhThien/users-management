package com.example.demo.entity;

import java.time.LocalDateTime;


import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Data;

@Entity
@Table(name = "transfer_request")
@Data
public class TransferRequest {
    @Id
    private String id;
    private String malopcu;
    private String malopmoi;
    private String reason;
    private String status;
    private LocalDateTime createAt;

    @ManyToOne
    @JoinColumn(name = "mssv")
    private SinhVien sinhVienT;
}
