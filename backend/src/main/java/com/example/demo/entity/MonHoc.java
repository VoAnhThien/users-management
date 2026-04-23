package com.example.demo.entity;

import java.util.List;

import com.fasterxml.jackson.annotation.JsonIgnore;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import lombok.Data;

@Entity
@Table(name = "monhocs")
@Data
public class MonHoc {
    @Id
    private String mamh;
    private String tenmh;
    private int sotietlt;
    private int sotietth;
    @OneToMany(mappedBy = "monHoc")
    @JsonIgnore
    private List<Grade> grades;
}
