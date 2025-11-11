# Implementation Tasks

## 1. Update Card Container Layout

- [x] 1.1 Change MovieCard container from `max-w-md h-[70vh]` to full-width `h-[85vh]`
- [x] 1.2 Remove horizontal max-width constraint
- [x] 1.3 Update border-radius for vertical format (optional: remove for edge-to-edge)
- [x] 1.4 Test card sizing on various mobile screen sizes

## 2. Adjust Video Player Container

- [x] 2.1 Update TrailerPlayer wrapper to fill vertical space
- [x] 2.2 Add `object-fit: cover` to iframe/video container
- [x] 2.3 Center video content with `object-position: center`
- [x] 2.4 Ensure video maintains aspect without stretching

## 3. Redesign Movie Info Overlay

- [x] 3.1 Move movie info to absolute bottom positioning
- [x] 3.2 Increase gradient overlay height for better readability
- [x] 3.3 Adjust text sizing for vertical space (larger title possible)
- [x] 3.4 Update padding and spacing for vertical layout
- [x] 3.5 Ensure description text doesn't overflow (line-clamp-2 or 3)

## 4. Update Poster Fallback Display

- [x] 4.1 Apply `object-fit: cover` to poster images
- [x] 4.2 Center poster content vertically
- [ ] 4.3 Test with various poster aspect ratios
- [ ] 4.4 Ensure fallback UI looks good in vertical format

## 5. Adjust Swipe Container

- [x] 5.1 Update main page swipe area height to accommodate taller cards
- [x] 5.2 Remove horizontal padding constraints
- [ ] 5.3 Test swipe gestures with vertical cards
- [ ] 5.4 Adjust swipe indicators position if needed

## 6. Optimize Button Positioning

- [x] 6.1 Keep favorite icon top-right (already correct)
- [x] 6.2 Ensure mute button doesn't overlap info text
- [ ] 6.3 Test button visibility against video content
- [ ] 6.4 Add stronger background to buttons if needed

## 7. Background Treatment

- [ ] 7.1 Test blurred background with vertical cards
- [ ] 7.2 Adjust background blur intensity if needed
- [ ] 7.3 Ensure background doesn't distract from vertical video

## 8. Mobile Testing & Polish

- [ ] 8.1 Test on iOS Safari (various iPhone sizes)
- [ ] 8.2 Test on Android Chrome (various screen sizes)
- [ ] 8.3 Verify safe-area handling (notches, bottom bars)
- [ ] 8.4 Test landscape orientation behavior
- [ ] 8.5 Verify swipe performance with taller cards
- [ ] 8.6 Check animation smoothness at 60fps

## 9. Edge Cases & Refinements

- [ ] 9.1 Handle very short posters gracefully
- [ ] 9.2 Test with trailers of different aspect ratios
- [ ] 9.3 Verify category tabs don't interfere with video
- [ ] 9.4 Ensure loading states look good in vertical format
- [ ] 9.5 Test empty/error states

## 10. Performance Validation

- [ ] 10.1 Verify no performance regression
- [ ] 10.2 Check memory usage with vertical format
- [ ] 10.3 Ensure smooth 60fps during swipes
- [ ] 10.4 Test with multiple rapid swipes
