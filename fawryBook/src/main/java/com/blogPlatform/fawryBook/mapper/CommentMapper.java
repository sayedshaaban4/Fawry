package com.blogPlatform.fawryBook.mapper;

import com.blogPlatform.fawryBook.dto.response.CommentResponse;
import com.blogPlatform.fawryBook.entity.Comment;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

/**
 * Why MapStruct for Comment mapping:
 * - Flattens author.id → authorId and author names → authorName at compile time
 * - No reflection overhead at runtime (unlike ModelMapper or manual mapping)
 * - If User entity field names change, the build fails immediately — no silent bugs
 */
@Mapper(componentModel = "spring")
public interface CommentMapper {

    /**
     * Maps Comment entity → CommentResponse DTO.
     *
     * Why @Mapping with expression for authorName:
     * - Concatenates firstName + lastName from the nested author object
     * - This is a computed field that doesn't exist on the entity — MapStruct handles it via a Java expression
     */
    @Mapping(source = "author.id", target = "authorId")
    @Mapping(target = "authorName", expression = "java(comment.getAuthor().getFirstName() + \" \" + comment.getAuthor().getLastName())")
    CommentResponse toResponse(Comment comment);
}

