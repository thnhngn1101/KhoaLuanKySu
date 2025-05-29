import smtplib

try:
    server = smtplib.SMTP('smtp.gmail.com', 587)
    server.starttls()
    server.login('tranmy19122003@gmail.com', 'ymys qgjd lsnk vyjv')
    print("Kết nối thành công!")
    server.quit()
except Exception as e:
    print(f"Lỗi: {e}")