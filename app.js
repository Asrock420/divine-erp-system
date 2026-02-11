function showSection(sectionId) {
    // ১. সব সেকশন লুকিয়ে ফেলি
    const sections = document.querySelectorAll('.section');
    sections.forEach(div => div.style.display = 'none');

    // ২. যেটা ক্লিক করা হয়েছে শুধু সেটা দেখাই
    document.getElementById(sectionId).style.display = 'block';

    // ৩. মেনুর কালার আপডেট করি (Active Class)
    const menuItems = document.querySelectorAll('.menu li');
    menuItems.forEach(li => li.classList.remove('active'));
    
    // (সিম্পল লজিক: ক্লিক করলে কালার চেঞ্জ হবে - এটা আমরা পরে আরও উন্নত করব)
    event.currentTarget.classList.add('active');
}