package com.example.demo.entity;

import java.util.List;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import lombok.Data;

@Entity
@Table(name = "sinhviens")
@Data
public class SinhVien {
    @Id
    private String mssv;
    private String ho;
    private String ten;
    private String ngaysinh;
    private boolean gioitinh;
    private String diachi;
    private boolean nghihoc;


    @OneToOne(cascade = CascadeType.ALL)
    @JoinColumn(name = "username",referencedColumnName = "username")
    @JsonIgnore
    private User user;

    @ManyToOne
    @JoinColumn(name = "malop")
    @JsonIgnoreProperties({"sinhviens","tenlop"})
    private Lop lop;
    @OneToMany(mappedBy = "sinhVien")
    @JsonIgnore
    private List<Grade> grades;

    @OneToMany(mappedBy = "sinhVienT")
    @JsonIgnore
    private List<TransferRequest> transferRequest;
}
