package com.example.demo.entity;

import java.util.List;

import com.fasterxml.jackson.annotation.JsonIgnore;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import lombok.Data;

@Entity
@Table(name = "lops")
@Data
public class Lop {
    @Id
    private String malop;
    private String tenlop;

    @OneToMany(mappedBy = "lop",cascade = CascadeType.ALL)
    @JsonIgnore
    private List<SinhVien> sinhviens;
}
