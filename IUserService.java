package com.project.GISPlatform.Service;


import com.project.GISPlatform.Entity.User;

import java.util.List;
import java.util.Optional;

public interface IUserService {
    User registerTheUser(User user);

    Optional<User> loginTheUser(String email, String password);

    Optional<User> getProfileById(Long userId);

    User updateUserProfile(User user, Long userId);

    User forgotPasswordOfUser(String email, String encodedPassword);

    List<User> getAllUsers();
}
