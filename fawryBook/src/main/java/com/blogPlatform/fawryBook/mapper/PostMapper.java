package com.blogPlatform.fawryBook.mapper;

import com.blogPlatform.fawryBook.dto.request.PostRequest;
import com.blogPlatform.fawryBook.dto.response.PostResponse;
import com.blogPlatform.fawryBook.entity.Post;
import org.mapstruct.*;

/**
 * Why MapStruct (not manual mapping):
 * - Generates mapping code at COMPILE time — no reflection overhead at runtime
 * - Type-safe: if you rename a field, the build fails
 * - componentModel = "spring" makes this a Spring bean injectable via constructor
 */
@Mapper(componentModel = "spring")
public interface PostMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "author", ignore = true)
    @Mapping(target = "comments", ignore = true)
    @Mapping(target = "reactions", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    Post toEntity(PostRequest request);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "author", ignore = true)
    @Mapping(target = "comments", ignore = true)
    @Mapping(target = "reactions", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    void updateEntity(PostRequest request, @MappingTarget Post post);

    @Mapping(source = "author.id", target = "authorId")
    @Mapping(target = "authorName", expression = "java(post.getAuthor().getFirstName() + \" \" + post.getAuthor().getLastName())")
    @Mapping(target = "likeCount", ignore = true)
    @Mapping(target = "dislikeCount", ignore = true)
    @Mapping(target = "commentCount", ignore = true)
    @Mapping(target = "rating", ignore = true)
    PostResponse toResponse(Post post);
}

