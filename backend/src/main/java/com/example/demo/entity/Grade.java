package com.example.demo.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import jakarta.persistence.EmbeddedId;
import jakarta.persistence.Entity;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.MapsId;
import jakarta.persistence.Table;
import lombok.Data;

@Entity
@Table(name = "grades")
@Data
public class Grade {
    @EmbeddedId
    private GradeId id;
    @ManyToOne
    @MapsId("mssv")
    @JoinColumn(name = "mssv")
    @JsonIgnoreProperties({"lop", "grades", "diachi", "nghihoc"})
    private SinhVien sinhVien;
    @ManyToOne
    @MapsId("mamh")
    @JoinColumn(name = "mamh")
    @JsonIgnoreProperties({"grades"})
    private MonHoc monHoc;
    private int hocky;
    private Double diem;
}
