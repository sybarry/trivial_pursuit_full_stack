#!/bin/bash
JAR=./lib/hsqldb.jar
if [ ! -f "$JAR" ]; then
	mkdir target
	wget -O ./target/hsqldb.zip https://sourceforge.net/projects/hsqldb/files/latest/download
	unzip -oq ./target/hsqldb.zip -d target
	mv target/hsqldb-2.7.2/hsqldb/lib .
fi
if ! grep -q lib/ ".gitignore"; then
  echo -e "\nlib/" >> .gitignore
fi
java -cp $JAR org.hsqldb.Server