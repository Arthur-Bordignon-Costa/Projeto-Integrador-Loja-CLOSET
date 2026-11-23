package com.closet.backendCloset.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;

@Service
public class CloudinaryService {

    private final Cloudinary cloudinary;

    public CloudinaryService() {
        this.cloudinary = new Cloudinary(System.getenv("CLOUDINARY_KEY"));
    }

    public Map fazerUpload(MultipartFile arquivo) throws IOException {

        return cloudinary.uploader().upload(
                arquivo.getBytes(),
                ObjectUtils.asMap("folder", "produtos")
        );
    }

    public void excluirImagem(String publicId) throws IOException {

        if (publicId == null || publicId.isBlank()) {
            System.out.println("Public ID vazio!");
            return;
        }
        cloudinary.uploader().destroy(
                publicId,
                ObjectUtils.emptyMap()
        );
    }
}