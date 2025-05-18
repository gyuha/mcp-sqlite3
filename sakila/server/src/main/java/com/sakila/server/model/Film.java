package com.sakila.server.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "film")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Film {

    @Id
    @Column(name = "film_id")
    private Integer filmId;

    @Column(name = "title", nullable = false)
    private String title;

    @Column(name = "description")
    private String description;

    @Column(name = "release_year")
    private Integer releaseYear;

    @Column(name = "language_id", nullable = false)
    private Integer languageId;

    @Column(name = "original_language_id")
    private Integer originalLanguageId;

    @Column(name = "rental_duration", nullable = false)
    private Integer rentalDuration;

    @Column(name = "rental_rate", nullable = false)
    private BigDecimal rentalRate;

    @Column(name = "length")
    private Integer length;

    @Column(name = "replacement_cost", nullable = false)
    private BigDecimal replacementCost;

    @Column(name = "rating")
    private String rating;

    @Column(name = "special_features")
    private String specialFeatures;

    @Column(name = "last_update", nullable = false)
    private LocalDateTime lastUpdate;
}
