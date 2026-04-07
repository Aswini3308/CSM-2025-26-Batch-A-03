package com.project.GISPlatform.Service.Impl;

import com.project.GISPlatform.Entity.User;
import com.project.GISPlatform.Repository.UserRepository;
import com.project.GISPlatform.Service.IUserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class UserService implements IUserService {

    @Autowired
    private UserRepository repo;

    @Autowired
    private PasswordEncoder encoder;

    @Override
    public User registerTheUser(User user) {
        Optional<User> presentUser = repo.findByEmail(user.getEmail());
        if(presentUser.isPresent()){
            throw new RuntimeException("User already present with this email! please login");
        }
        else{
            return repo.save(user);
        }
    }

    @Override
    public Optional<User> loginTheUser(String email, String password) {
        Optional<User> presentUser = repo.findByEmail(email);
        if(presentUser.isEmpty() || !encoder.matches(password,presentUser.get().getPassword())){
            throw new RuntimeException("Invalid email or password");
        }
        else{
            return presentUser;
        }
    }

    @Override
    public Optional<User> getProfileById(Long userId) {
        Optional<User> presentProfile = repo.findById(userId);
        if(presentProfile.isEmpty()){
            throw new RuntimeException("No user found with the provided id : " + userId);
        }
        else{
            return presentProfile;
        }
    }

    @Override
    public User updateUserProfile(User user, Long userId) {
        Optional<User> presentProfile = repo.findById(userId);
        if(presentProfile.isEmpty()){
            throw new RuntimeException("No user found to update the profile with id : " + userId);
        }
        else{
            User needToUpdate = presentProfile.get();
            needToUpdate.setUsername(user.getUsername());
            needToUpdate.setEmail(user.getEmail());

            // Only update password if it's provided and not empty
            if (user.getPassword() != null && !user.getPassword().trim().isEmpty()) {
                System.out.println("UPDATING PASSWORD - Encoding new password");
                needToUpdate.setPassword(encoder.encode(user.getPassword()));
            } else {
                System.out.println("KEEPING CURRENT PASSWORD - No update needed");
                // Explicitly do nothing to keep current password
            }

            System.out.println("Final password in DB will be: " + (user.getPassword() != null && !user.getPassword().trim().isEmpty() ? "NEW" : "CURRENT"));
            System.out.println("=== END DEBUG ===");

            return repo.save(needToUpdate);
        }
    }

    @Override
    public User forgotPasswordOfUser(String email, String encodedPassword) {
        Optional<User> presentEmail = repo.findByEmail(email);
        if(presentEmail.isEmpty()){
            throw new RuntimeException("No user found to update the password");
        }
        else{
            User needToUpdate = presentEmail.get();
            needToUpdate.setPassword(encodedPassword);
            return repo.save(needToUpdate);
        }
    }

    @Override
    public List<User> getAllUsers() {
        return repo.findAll();
    }


}
