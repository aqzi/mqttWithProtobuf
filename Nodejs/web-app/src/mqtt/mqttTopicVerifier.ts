export function matches(topicPattern: string, topic: string) {
    const patternSegments = topicPattern.split('/');
    const topicSegments = topic.split('/');

    for (let i = 0; i < patternSegments.length; i++) {
        const patternSegment = patternSegments[i];
        const topicSegment = topicSegments[i];

        // Check for wildcard matches
        if(patternSegment === '#') return true;
        else if(patternSegment === '+') continue;
    
        // Check for exact segment match
        if (patternSegment !== topicSegment) return false;
    }

    return true;
}
