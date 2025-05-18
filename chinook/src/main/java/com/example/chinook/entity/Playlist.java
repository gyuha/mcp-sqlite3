package com.example.chinook.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "playlists")
@Getter
@Setter
@NoArgsConstructor
public class Playlist {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "PlaylistId")
    private Long id;

    @Column(name = "Name")
    private String name;

    @ManyToMany
    @JoinTable(
        name = "playlist_track",
        joinColumns = @JoinColumn(name = "PlaylistId"),
        inverseJoinColumns = @JoinColumn(name = "TrackId")
    )
    private Set<Track> tracks = new HashSet<>();
}
