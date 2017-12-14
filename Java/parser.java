import java.io.*;
import java.util.*;

class courseSort implements Comparator<String>{
    @Override
    public int compare(String a, String b){
        try{
            int pg1 = Integer.parseInt(a.replaceAll("[^0-9]", ""));
            int pg2 = Integer.parseInt(b.replaceAll("[^0-9]", ""));
            return pg1 - pg2;
        }catch(Exception e){
            System.out.println("Error for Strings: " + a + " and " + b);
            return 0;
        }
    
    }
}

public class parser{
    public static void main(String[] args){
        File file = new File(args[0]);
        String schoolID = args[1];
        Scanner input = null;
        try{
            input = new Scanner(file);
        }catch(Exception e){
            System.out.println("Error opening file");
        }
        ArrayList<String> underGradMajors = new ArrayList<String>();
        ArrayList<String> gradMajors = new ArrayList<String>();
        int sizes[] = new int[2];

        while(input.hasNext()){
            String nextLine = input.nextLine();
            if(nextLine.equals("Undergraduate Academic Majors")){
                sizes = getMajors(input, underGradMajors, gradMajors);
                break;
            }

        }
        String[] uMajors = underGradMajors.toArray(new String[underGradMajors.size()]);
        Arrays.sort(uMajors, new courseSort());
        System.out.println("UnderGrad Majors: ");
        for(int i = 0; i < uMajors.length; i++){
            System.out.println(uMajors[i]);
        }

        //Now we need to generate the class core and the classes info
        String[][] core = getCore(uMajors, input);

        /*System.out.println("\nGraduate Majors: ");
        for(int i = 0; i < sizes[1] - 1; i++){
            System.out.println(gradMajors.get(i));
        }*/
    }

    public static String[][] getCore(String[] majors, Scanner input){
        String[][] core = new String[majors.length][30];
        //major index of the 2d array
        int mIndex = 0;
        //core index of the 2d array
        int cIndex = 0;
        int flag = 0;
        for(int i = 0; i < majors.length(); i++){
            String major = majors[i].substring(0, indexOf(" ("));
            core[mIndex] = major;
            //write major to the first index of the core 2d array
            System.out.println("current major is: " + major);
            int page = Integer.parseInt(majors[i].replaceAll("[^0-9]", ""));
            //Need to check if PG number is even or odd
            if(page % 2 != 0) page--;
            while(input.hasNext()){
                

                }
            }
        }    
    }

    public static int[] getMajors(Scanner input, ArrayList<String> underGradMajors, ArrayList<String> gradMajors){
        int[] sizes = new int[2];
        String line = "";
        //Get the undergrad Majors
        while(input.hasNext()){
            line = input.nextLine();
            if(line.equals("Graduate Majors")) break;
            if(line.equals("Cross-Disciplinary Programs")) continue;
            if(line.equals("Integrated Degree in Engineering, Arts and Sciences (IDEAS)")) line += input.nextLine();
            if(line.equals("Elementary and Secondary Education (5-year program) (p. 53)")) line = line.substring(0, 35) + line.substring(52);
            if(line.length() > 1){
                underGradMajors.add(line);
                sizes[0]++;
            }
        }
        //Get the Graduate Majors
        /*while(input.hasNext()){
            line = input.nextLine();
            if(line.equals("Lehigh University 2016-2017")) break;
            if(line.equals("Mission Statement")) break;
            if(line.length() > 1){
                gradMajors.add(line);
                sizes[1]++;
            }
        }*/
        return sizes;
    }
}