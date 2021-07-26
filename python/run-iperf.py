import subprocess
import os
import pty
import time

master, slave = pty.openpty()

bytess = 1000*1000*50

process = subprocess.Popen('iperf3 -c 5g.schsolution.cz --rsa-public-key-path public2.pem --username petr --forceflush --json --bytes '+str(bytess), stdin=slave, stdout=subprocess.PIPE, shell=True)

time.sleep(2)

pin = os.fdopen(master, "w")
pin.write("tentono\n")
pin.flush()

file = open("test.txt", "w+")

answer = process.communicate()[0].decode(encoding='utf-8')

print(answer)
file.write(answer)
pin.close()
os.close(slave)